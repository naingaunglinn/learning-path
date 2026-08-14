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
import { buildSeedData, seedCourses, seedMilestones, seedProfile } from "./seed-data";
import { rescheduleFrom } from "./schedule";
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
   safe to rebuild.
   v3: targetStartMonth became nullable ("Unscheduled"), seed months were
   re-sequenced per the design-v2 spec, and the dayEvents collection was
   added. v2 workspaces may hold user-entered data, so v2 -> v3 migrates
   in place instead of reseeding.
   v4: profile gained workspaceCreatedAt (overdue suppression for derived
   deadlines that predate the workspace).
   v5: the Coursera Plus era (2026-08). Courses gained durationWeeks + phase;
   financial-aid tracking became legacy (off by default). The seed curriculum
   and goal milestones were re-authored around the verified Plus path, so
   v4 -> v5 swaps seed-owned rows for their v5 versions in place while
   preserving user progress (status/completedDate) and user-added rows.
   v6: the Warm-up parallel track (fundamentals courses) joined the seed
   curriculum — v5 -> v6 is add-only: unknown seed course ids are appended,
   nothing existing is touched.
   v7: courses gained plannedStartDate (day-precise starts). v6 -> v7 runs
   one "Replan from today" so the daily calendar fill flows from the
   migration date; the same replan is available in the Learning toolbar.
   v8: replan semantics corrected — day 1 of the in-progress course IS the
   replan date (the path was created today, not on the 1st of the month).
   v7 -> v8 re-runs the replan under the new rule.
   v9: one subject per day — the warm-up track moved from daily 30-min
   fragments to a single Sunday 3 h block (same weekly rate; a pure
   derive-logic change), and system-design self-study moved to M9 so it
   takes over the Sunday slot only after the warm-up ends.
   v10: courses gained a syllabus checklist (modules), seeded from each
   course's published Coursera syllabus. v9 -> v10 fills the checklist onto
   seed-owned rows that don't have one; completed courses arrive fully
   checked. The same backfill runs on import for pre-v10 backups.
   v11: re-runs the v10 backfill. A tab still running pre-v10 code strips
   the modules field on any write (Zod drops unknown keys), leaving a
   v10-stamped store with empty checklists; the backfill is idempotent, so
   healthy stores pass through untouched. */
const SCHEMA_VERSION = 11;

/* Roadmap re-sequencing applied to the five known seed courses on migration. */
const V3_SEED_COURSE_MONTHS: Record<string, number> = {
  "co-genai-llms": 1,
  "co-python-ai": 1,
  "co-ibm-genai": 4,
  "co-system-design": 8,
  "co-sre-gcp": 11,
};

function migrateV2toV3() {
  const raw = backend.read(`${NS}:courses`);
  if (raw) {
    try {
      const rows: Array<Record<string, unknown>> = JSON.parse(raw);
      for (const row of rows) {
        if (typeof row.id === "string" && row.id in V3_SEED_COURSE_MONTHS) {
          row.targetStartMonth = V3_SEED_COURSE_MONTHS[row.id];
        }
        if (row.targetStartMonth === undefined) row.targetStartMonth = null;
      }
      backend.write(`${NS}:courses`, JSON.stringify(rows));
    } catch {
      /* unreadable courses payload — schema is null-tolerant, leave it */
    }
  }
  if (!backend.read(`${NS}:dayEvents`)) backend.write(`${NS}:dayEvents`, "[]");
}

function migrateV3toV4() {
  const raw = backend.read(PROFILE_KEY);
  if (!raw) return;
  try {
    const profile = JSON.parse(raw);
    if (!profile.workspaceCreatedAt) {
      profile.workspaceCreatedAt = new Date().toISOString().slice(0, 10);
      backend.write(PROFILE_KEY, JSON.stringify(profile));
    }
  } catch {
    /* schema default fills it on next read */
  }
}

/* Seed rows v5 removes outright: aid-driven items made moot by Coursera Plus,
   and milestones superseded by the re-authored goal timeline. */
const V5_REMOVED_IDS: Partial<Record<CollectionKey, string[]>> = {
  critical: ["cp-coursera-aid"],
  weekly: ["wk-2"], // "File Coursera Financial Aid" — replaced in the v5 seed
  milestones: ["ms-2027-05", "ms-2027-10"],
};

/** Seed-owned rows get their v5 version (keeping user progress fields);
    user-added rows pass through untouched. */
function migrateV4toV5() {
  const now = new Date().toISOString();

  function mergeCollection(
    key: "courses" | "milestones",
    v5Rows: Array<Record<string, unknown> & { id: string }>,
    progressFields: string[]
  ) {
    let old: Array<Record<string, unknown>> = [];
    try {
      old = JSON.parse(backend.read(`${NS}:${key}`) ?? "[]");
    } catch {
      /* unreadable — rebuild from the v5 seed alone */
    }
    const oldById = new Map(old.map((r) => [r.id as string, r]));
    const v5Ids = new Set(v5Rows.map((r) => r.id));
    const removed = new Set(V5_REMOVED_IDS[key] ?? []);

    const merged: Array<Record<string, unknown>> = v5Rows.map((row) => {
      const prev = oldById.get(row.id);
      const kept = Object.fromEntries(
        progressFields.filter((f) => prev && prev[f] !== undefined).map((f) => [f, prev![f]])
      );
      return { createdAt: prev?.createdAt ?? now, updatedAt: now, ...row, ...kept };
    });
    for (const row of old) {
      const id = row.id as string;
      if (!v5Ids.has(id) && !removed.has(id)) merged.push(row);
    }
    backend.write(`${NS}:${key}`, JSON.stringify(merged));
  }

  mergeCollection("courses", seedCourses as never, ["status", "completedDate"]);
  mergeCollection("milestones", seedMilestones as never, ["status"]);

  for (const key of ["critical", "weekly"] as const) {
    const removed = new Set(V5_REMOVED_IDS[key] ?? []);
    try {
      const rows: Array<Record<string, unknown>> = JSON.parse(backend.read(`${NS}:${key}`) ?? "[]");
      backend.write(
        `${NS}:${key}`,
        JSON.stringify(rows.filter((r) => !(removed.has(r.id as string) && r.done !== true && r.status !== "done")))
      );
    } catch {
      /* leave unreadable payloads alone; safeParse drops bad rows on read */
    }
  }
}

/** Append seed courses the workspace doesn't have yet (the Warm-up track).
    Add-only: existing rows, including user edits, are never rewritten. */
function migrateV5toV6() {
  const now = new Date().toISOString();
  try {
    const rows: Array<Record<string, unknown>> = JSON.parse(backend.read(`${NS}:courses`) ?? "[]");
    const have = new Set(rows.map((r) => r.id));
    const added = seedCourses
      .filter((c) => !have.has(c.id))
      .map((c) => ({ createdAt: now, updatedAt: now, ...c }));
    if (added.length) backend.write(`${NS}:courses`, JSON.stringify([...rows, ...added]));
  } catch {
    /* unreadable courses payload — leave it; safeParse guards reads */
  }
}

/** Stamp day-precise starts by replanning the remaining path from today.
    Runs for v6 -> v7 and again for v7 -> v8 (semantics change). */
function replanCoursesFromToday() {
  try {
    const rows: Array<Record<string, unknown>> = JSON.parse(backend.read(`${NS}:courses`) ?? "[]");
    const profileRaw = JSON.parse(backend.read(PROFILE_KEY) ?? "{}");
    const profile = {
      timelineStart: typeof profileRaw?.timelineStart === "string" ? profileRaw.timelineStart : "2026-08",
      timelineMonths: typeof profileRaw?.timelineMonths === "number" ? profileRaw.timelineMonths : 18,
    };
    const patches = rescheduleFrom(profile, rows as never, new Date().toISOString().slice(0, 10));
    const byId = new Map(patches.map((p) => [p.id, p.patch]));
    const now = new Date().toISOString();
    for (const row of rows) {
      const patch = byId.get(row.id as string);
      if (patch) Object.assign(row, patch, { updatedAt: now });
    }
    backend.write(`${NS}:courses`, JSON.stringify(rows));
  } catch {
    /* unreadable payload — plannedStartDate stays null; month starts apply */
  }
}

/** Move the seed system-design row to M9 (Sundays hand over from the
    warm-up track). Skipped if the user already rescheduled or finished it. */
function migrateV8toV9() {
  try {
    const rows: Array<Record<string, unknown>> = JSON.parse(backend.read(`${NS}:courses`) ?? "[]");
    const row = rows.find((r) => r.id === "co-system-design");
    if (row && row.status !== "completed" && row.targetStartMonth === 6) {
      row.targetStartMonth = 9;
      row.plannedStartDate = null;
      row.updatedAt = new Date().toISOString();
      backend.write(`${NS}:courses`, JSON.stringify(rows));
    }
  } catch {
    /* leave it — worst case two Sunday tracks overlap for a few weeks */
  }
}

/** Fill the seeded syllabus checklist onto known courses that lack one.
    Add-only per row: a non-empty modules list is never rewritten, and a
    completed course gets its checklist stamped done. Shared by the v10
    migration and by import (pre-v10 backups have no modules). */
function backfillCourseModules(rows: Array<Record<string, unknown>>): boolean {
  const seedModules = new Map(seedCourses.map((c) => [c.id, c.modules]));
  const now = new Date().toISOString();
  let changed = false;
  for (const row of rows) {
    const completed = row.status === "completed";
    const stamp =
      typeof row.completedDate === "string" && row.completedDate
        ? row.completedDate
        : now.slice(0, 10);
    const existing = Array.isArray(row.modules)
      ? (row.modules as Array<Record<string, unknown>>)
      : [];
    if (existing.length === 0) {
      const seeded = seedModules.get(row.id as string);
      if (!seeded?.length) continue;
      row.modules = seeded.map((m) => ({
        ...m,
        done: completed,
        completedDate: completed ? stamp : null,
      }));
    } else if (completed && existing.some((m) => !m.done)) {
      /* Completed course ⇒ every module done. Normalizes rows whose
         checklist arrived unchecked via the v5 seed merge on old stores. */
      row.modules = existing.map((m) => (m.done ? m : { ...m, done: true, completedDate: stamp }));
    } else {
      continue;
    }
    row.updatedAt = now;
    changed = true;
  }
  return changed;
}

function migrateV9toV10() {
  try {
    const rows: Array<Record<string, unknown>> = JSON.parse(backend.read(`${NS}:courses`) ?? "[]");
    if (backfillCourseModules(rows)) backend.write(`${NS}:courses`, JSON.stringify(rows));
  } catch {
    /* unreadable payload — the schema parses modules to [] and the UI degrades */
  }
}

/** A tab still running pre-v10 code strips the modules KEY from every row
    whenever it writes courses (Zod drops unknown keys) — and if a current
    tab then re-reads and saves, the stripped rows come back as explicit
    modules: [] on every course. Both signatures mean the same thing: the
    whole store lost its checklists. Detect that on every load and refill.
    The trigger is "no seed course has ANY checklist content" — a user
    emptying one course's checklist in the dialog leaves the others
    non-empty, so deliberate edits are never overridden. */
function healStrippedModules() {
  try {
    const raw = backend.read(`${NS}:courses`);
    if (!raw) return;
    const rows: Array<Record<string, unknown>> = JSON.parse(raw);
    const seedIds = new Set(seedCourses.map((c) => c.id));
    const seedRows = rows.filter((r) => seedIds.has(r.id as string));
    const anyFilled = seedRows.some((r) => Array.isArray(r.modules) && r.modules.length > 0);
    if (seedRows.length === 0 || anyFilled) return;
    if (backfillCourseModules(rows)) backend.write(`${NS}:courses`, JSON.stringify(rows));
  } catch {
    /* unreadable payload — reads degrade to [] */
  }
}

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
      const version = JSON.parse(rawMeta).schemaVersion;
      if (version === SCHEMA_VERSION) {
        healStrippedModules();
        return;
      }
      if (version >= 2 && version < SCHEMA_VERSION) {
        if (version === 2) migrateV2toV3();
        if (version <= 3) migrateV3toV4();
        if (version <= 4) migrateV4toV5();
        if (version <= 5) migrateV5toV6();
        if (version <= 7) replanCoursesFromToday();
        if (version <= 8) migrateV8toV9();
        /* <= 10, not <= 9: v11 re-runs the same idempotent backfill to heal
           stores whose checklists were stripped by a stale pre-v10 tab. */
        if (version <= 10) migrateV9toV10();
        backend.write(
          META_KEY,
          JSON.stringify({ migratedAt: new Date().toISOString(), schemaVersion: SCHEMA_VERSION })
        );
        return;
      }
      /* version 1 predates any write UI -> safe to rebuild below */
    } catch {
      /* unreadable meta -> rebuild */
    }
  }
  const data = buildSeedData();
  for (const key of Object.keys(collectionSchemas) as CollectionKey[]) {
    backend.write(`${NS}:${key}`, JSON.stringify(data[key]));
  }
  backend.write(
    PROFILE_KEY,
    JSON.stringify({ ...seedProfile, workspaceCreatedAt: new Date().toISOString().slice(0, 10) })
  );
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
  /* Backups from before v10 carry no module checklists — refill seed-owned ones. */
  backfillCourseModules(data.courses as unknown as Array<Record<string, unknown>>);
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
