import {
  ActivityEvent,
  activityKinds,
  CollectionKey,
  collectionSchemas,
  CollectionType,
  ExportEnvelope,
  ExportEnvelopeSchema,
  Profile,
  ProfileSchema,
} from "./schemas";
import { buildSeedData, seedProfile } from "./seed-data";
import { newId } from "./id";

/* ------------------------------------------------------------------ */
/* Persistence boundary. Everything the app stores goes through this   */
/* file — swap the `backend` object for a real DB adapter later and    */
/* nothing above this layer changes.                                   */
/* ------------------------------------------------------------------ */

const NS = "ccc:v1";
const META_KEY = `${NS}:meta`;
const PROFILE_KEY = `${NS}:profile`;
const ACTIVITY_CAP = 50;
/* v2: courses gained targetStartMonth + Financial Aid fields (2026-08).
   v1 shipped with no write UI, so v1 data can only be seed data and is
   safe to rebuild. Future bumps need a real migration instead. */
const SCHEMA_VERSION = 2;

const isBrowser = typeof window !== "undefined";

const backend = {
  read(key: string): string | null {
    return isBrowser ? window.localStorage.getItem(key) : null;
  },
  write(key: string, value: string) {
    if (isBrowser) window.localStorage.setItem(key, value);
  },
};

/* ---------------- change notification ---------------- */

const listeners = new Map<string, Set<() => void>>();

function emit(channel: string) {
  listeners.get(channel)?.forEach((fn) => fn());
}

function subscribeTo(channel: string, fn: () => void): () => void {
  let set = listeners.get(channel);
  if (!set) listeners.set(channel, (set = new Set()));
  set.add(fn);
  return () => set.delete(fn);
}

/* Cross-tab sync: another tab's write invalidates our cache. */
let crossTabBound = false;
function bindCrossTab() {
  if (!isBrowser || crossTabBound) return;
  crossTabBound = true;
  window.addEventListener("storage", (e) => {
    if (!e.key?.startsWith(NS)) return;
    if (e.key === PROFILE_KEY) {
      profileCache = undefined;
      emit("profile");
      return;
    }
    const key = e.key.slice(NS.length + 1) as CollectionKey;
    stores[key]?.invalidate();
  });
}

/* ---------------- seeding ---------------- */

let seedChecked = false;

export function ensureSeeded() {
  if (!isBrowser || seedChecked) return;
  seedChecked = true;
  bindCrossTab();
  const rawMeta = backend.read(META_KEY);
  if (rawMeta) {
    try {
      if (JSON.parse(rawMeta).schemaVersion === SCHEMA_VERSION) return;
    } catch {
      /* unreadable meta -> rebuild */
    }
  }
  const data = buildSeedData();
  for (const key of Object.keys(collectionSchemas) as CollectionKey[]) {
    backend.write(`${NS}:${key}`, JSON.stringify(data[key]));
  }
  backend.write(PROFILE_KEY, JSON.stringify(seedProfile));
  backend.write(META_KEY, JSON.stringify({ seededAt: new Date().toISOString(), schemaVersion: SCHEMA_VERSION }));
}

/* ---------------- collection store ---------------- */

export class Store<K extends CollectionKey> {
  private cache: CollectionType[K][] | null = null;
  private readonly empty: CollectionType[K][] = [];

  constructor(readonly key: K) {}

  private storageKey() {
    return `${NS}:${this.key}`;
  }

  invalidate = () => {
    this.cache = null;
    emit(this.key);
  };

  /** Stable-reference snapshot for useSyncExternalStore. */
  snapshot = (): CollectionType[K][] => {
    if (!isBrowser) return this.empty;
    if (this.cache) return this.cache;
    ensureSeeded();
    const raw = backend.read(this.storageKey());
    if (!raw) return (this.cache = this.empty);
    try {
      const parsed: unknown[] = JSON.parse(raw);
      const schema = collectionSchemas[this.key];
      const valid: CollectionType[K][] = [];
      for (const item of parsed) {
        const result = schema.safeParse(item);
        if (result.success) valid.push(result.data as CollectionType[K]);
        else console.warn(`[storage] dropped invalid ${this.key} row`, result.error.issues);
      }
      return (this.cache = valid);
    } catch {
      console.warn(`[storage] unreadable collection ${this.key}, treating as empty`);
      return (this.cache = this.empty);
    }
  };

  serverSnapshot = (): CollectionType[K][] => this.empty;

  subscribe = (fn: () => void) => subscribeTo(this.key, fn);

  private persist(rows: CollectionType[K][]) {
    const schema = collectionSchemas[this.key];
    const checked = rows.map((r) => schema.parse(r) as CollectionType[K]);
    backend.write(this.storageKey(), JSON.stringify(checked));
    this.cache = checked;
    emit(this.key);
  }

  list(): CollectionType[K][] {
    return this.snapshot();
  }

  get(id: string): CollectionType[K] | undefined {
    return this.snapshot().find((r) => r.id === id);
  }

  create(input: Omit<CollectionType[K], "id" | "createdAt" | "updatedAt"> & { id?: string }): CollectionType[K] {
    const now = new Date().toISOString();
    const row = { ...input, id: input.id ?? newId(), createdAt: now, updatedAt: now } as CollectionType[K];
    this.persist([row, ...this.snapshot()]);
    return row;
  }

  update(id: string, patch: Partial<CollectionType[K]>): CollectionType[K] | undefined {
    let updated: CollectionType[K] | undefined;
    const next = this.snapshot().map((row) => {
      if (row.id !== id) return row;
      updated = { ...row, ...patch, id, updatedAt: new Date().toISOString() };
      return updated;
    });
    if (updated) this.persist(next);
    return updated;
  }

  remove(id: string): boolean {
    const rows = this.snapshot();
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length) return false;
    this.persist(next);
    return true;
  }

  replaceAll(rows: CollectionType[K][]) {
    this.persist(rows);
  }
}

export const stores: { [K in CollectionKey]: Store<K> } = Object.fromEntries(
  (Object.keys(collectionSchemas) as CollectionKey[]).map((k) => [k, new Store(k)])
) as { [K in CollectionKey]: Store<K> };

/* ---------------- profile (singleton) ---------------- */

let profileCache: Profile | undefined;

export const profileStore = {
  snapshot(): Profile {
    if (!isBrowser) return seedProfile;
    if (profileCache) return profileCache;
    ensureSeeded();
    const raw = backend.read(PROFILE_KEY);
    if (!raw) return (profileCache = seedProfile);
    const parsed = ProfileSchema.safeParse(JSON.parse(raw));
    return (profileCache = parsed.success ? parsed.data : seedProfile);
  },
  serverSnapshot(): Profile {
    return seedProfile;
  },
  set(patch: Partial<Profile>) {
    const next = ProfileSchema.parse({ ...profileStore.snapshot(), ...patch });
    backend.write(PROFILE_KEY, JSON.stringify(next));
    profileCache = next;
    emit("profile");
  },
  subscribe(fn: () => void) {
    return subscribeTo("profile", fn);
  },
};

/* ---------------- activity log ---------------- */

export function logActivity(kind: (typeof activityKinds)[number], message: string) {
  if (!isBrowser) return;
  const event: ActivityEvent = { id: newId(), at: new Date().toISOString(), kind, message };
  stores.activity.replaceAll([event, ...stores.activity.list()].slice(0, ACTIVITY_CAP));
}

/* ---------------- export / import ---------------- */

export function exportAll(): ExportEnvelope {
  ensureSeeded();
  const data = Object.fromEntries(
    (Object.keys(collectionSchemas) as CollectionKey[]).map((k) => [k, stores[k].list()])
  ) as ExportEnvelope["data"];
  return {
    app: "career-command-center",
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: profileStore.snapshot(),
    data,
  };
}

export type ImportResult =
  | { ok: true; counts: Record<string, number> }
  | { ok: false; error: string };

export function importAll(json: unknown): ImportResult {
  const result = ExportEnvelopeSchema.safeParse(json);
  if (!result.success) {
    const issue = result.error.issues[0];
    return { ok: false, error: `${issue.path.join(".") || "root"}: ${issue.message}` };
  }
  const { data, profile } = result.data;
  for (const key of Object.keys(collectionSchemas) as CollectionKey[]) {
    stores[key].replaceAll(data[key] as never[]);
  }
  profileStore.set(profile);
  const counts = Object.fromEntries(Object.entries(data).map(([k, rows]) => [k, rows.length]));
  logActivity("imported", `Imported backup from ${result.data.exportedAt.slice(0, 10)}`);
  return { ok: true, counts };
}

/** Wipe everything and re-seed. Destructive — gate behind a confirm dialog. */
export function resetToSeed() {
  if (!isBrowser) return;
  for (const key of Object.keys(collectionSchemas) as CollectionKey[]) {
    window.localStorage.removeItem(`${NS}:${key}`);
  }
  window.localStorage.removeItem(PROFILE_KEY);
  window.localStorage.removeItem(META_KEY);
  seedChecked = false;
  profileCache = undefined;
  ensureSeeded();
  for (const key of Object.keys(collectionSchemas) as CollectionKey[]) {
    stores[key].invalidate();
  }
  emit("profile");
}
