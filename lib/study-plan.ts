import type { Course, GapProject, Profile } from "./schemas";
import { addDaysISO } from "./dates";
import { courseEndISO, courseStartISO } from "./aid";
import { isWarmupPhase, type StudyCapacity } from "./schedule";
import { effortFor, syllabusSource, type SyllabusItemKind, type SyllabusSource } from "./course-syllabus";
import { lessonsFor } from "./topics";

/* ------------------------------------------------------------------ */
/* The day-level study plan, derived — never stored. Pure function of  */
/* (profile, courses, capacity, fromISO, check state): same inputs     */
/* produce identical sessions including ids, so replans regenerate the */
/* calendar with nothing to duplicate or orphan. Checked lessons and   */
/* checked modules simply leave the stream, which is how completion    */
/* advances the plan.                                                  */
/*                                                                     */
/* Day ownership (one subject per day): Mon–Fri main path, Saturday    */
/* the gap-project track, Sunday the warm-up deep block. Sessions are  */
/* typed Learn / Practice / Apply / Retrieve / Ship so the calendar    */
/* forces retrieval and application, not consumption: each module gets */
/* closed-book recall at +1/+7/+30 days folded into existing blocks,   */
/* and every course ends with a Ship checkpoint that writes evidence.  */
/* ------------------------------------------------------------------ */

export type SessionType = "learn" | "practice" | "apply" | "retrieve" | "ship" | "open";

export type PlanItem = {
  title: string;
  kind?: SyllabusItemKind;
  minutes: number;
  /** Set when a long item spans blocks: which part this session holds. */
  part?: string;
};

export type PlanSession = {
  /** Stable, derived id — e.g. "co-python-ai-m02-s03", "gp-rag-s05". */
  id: string;
  date: string; // YYYY-MM-DD
  courseId: string | null;
  gapProjectId: string | null;
  moduleId: string | null;
  title: string;
  type: SessionType;
  minutes: number;
  items: PlanItem[];
  /** What exists at the end of the session that didn't before. */
  output: string;
  source: SyllabusSource | null;
};

export type CourseLoad = {
  courseId: string;
  title: string;
  /** Effort-adjusted content minutes still to schedule from fromISO. */
  minutes: number;
  /** Block minutes available inside the course's planned window. */
  windowMinutes: number;
  packedEnd: string | null;
  targetEnd: string | null;
  /** Positive = content lands after the planned finish. */
  overrunDays: number;
};

export type WeekLoad = {
  weekStart: string;
  minutes: number;
  byType: Record<SessionType, number>;
  /** Learn share of the rolling 4-week window ending at this week. */
  learnShare4w: number;
};

export type StudyPlan = {
  sessions: PlanSession[];
  courseLoads: CourseLoad[];
  weeks: WeekLoad[];
  /** Rolling 4-week windows where Learn exceeded capacity.learnCap. */
  ratioViolations: { weekStart: string; learnShare: number }[];
};

type TimelineProfile = Pick<Profile, "timelineStart" | "timelineMonths" | "targetDate">;
type PlanCourse = Pick<
  Course,
  "id" | "title" | "status" | "phase" | "durationWeeks" | "targetStartMonth" | "plannedStartDate" | "modules"
>;
type PlanGap = Pick<GapProject, "id" | "title" | "status">;

/* ---------------- the Saturday project track ---------------- */

/* Authored arcs — one focus per Saturday, sequenced toward the seed
   milestones (RAG v1 in Nov '26, shipped + cert in Dec '26, streaming
   feature in Mar '27, SRE evidence in Jun '27). Content in code, like
   the syllabi: a reset can never eat it. */
const PROJECT_WINDOWS: { id: string; from: string; to: string }[] = [
  { id: "gp-adr", from: "2026-08-01", to: "2026-09-30" },
  { id: "gp-rag", from: "2026-10-01", to: "2026-12-31" },
  { id: "gp-llm-feature", from: "2027-01-01", to: "2027-03-31" },
  { id: "gp-sre", from: "2027-04-01", to: "2027-06-30" },
];

const PROJECT_ARCS: Record<string, string[]> = {
  "gp-adr": [
    "ADR #1 — Stripe points ledger: draft the decision record",
    "ADR #1 — revise + publish",
    "ADR #2 — CI/CD pipeline: draft the decision record",
    "ADR #2 — revise + publish",
    "ADR #3 — multi-tenant contract flow: draft",
    "ADR #3 — revise + publish; portfolio evidence entry",
  ],
  "gp-rag": [
    "Corpus + ingestion pipeline skeleton",
    "pgvector schema + embedding store",
    "Retriever v0 + smoke test queries",
    "Eval harness: recall@k baseline (this is the moat)",
    "Hybrid search: ts_vector + GIN alongside pgvector",
    "Reranking + score fusion",
    "Eval report: hybrid vs vector-only",
    "API + minimal UI",
    "Deploy + request logging",
    "recall@k tracked per release (CI hook)",
    "Write-up + publish; post to LangChain community",
    "Reuse as the RAG-cert capstone project",
  ],
  "gp-llm-feature": [
    "Feature spec + SSE streaming skeleton",
    "Token streaming end-to-end",
    "Per-request cost metering",
    "p95 latency dashboard",
    "Cost-per-request dashboard",
    "Error paths + graceful degradation",
    "Ship to real users at MML",
    "Write-up: latency + unit economics",
  ],
  "gp-sre": [
    "Run the service on Kubernetes (pairs with GKE course)",
    "Prometheus + Grafana wiring",
    "Terraform the infrastructure",
    "Write SLOs + error budget",
    "Alerting on SLO burn rate",
    "Load test + capacity notes",
    "Runbook + blameless postmortem template",
    "Write-up: SLOs with error budgets, published",
  ],
};

/* ---------------- date helpers ---------------- */

const dow = (iso: string) => new Date(iso + "T00:00:00Z").getUTCDay(); // 0 = Sunday

function* ownedDays(fromISO: string, toISO: string, owner: "main" | "project" | "deep") {
  for (let d = fromISO; d < toISO; d = addDaysISO(d, 1)) {
    const w = dow(d);
    const own = w === 0 ? "deep" : w === 6 ? "project" : "main";
    if (own === owner) yield d;
  }
}

/** Monday of the ISO week containing the date. */
function weekStartOf(iso: string): string {
  return addDaysISO(iso, -((dow(iso) + 6) % 7));
}

/* ---------------- course item streams ---------------- */

type StreamItem = {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  kind?: SyllabusItemKind;
  minutes: number; // effort-adjusted
  source: SyllabusSource;
};

const DEFAULT_TOPIC_MINUTES = 25;

function chainOrder(a: PlanCourse, b: PlanCourse): number {
  return (
    Number(b.status === "in_progress") - Number(a.status === "in_progress") ||
    (a.targetStartMonth ?? 99) - (b.targetStartMonth ?? 99) ||
    a.title.localeCompare(b.title)
  );
}

/** Remaining (unchecked) work of one course as an ordered item stream. */
function courseStream(course: PlanCourse, checked: ReadonlySet<string>): StreamItem[] {
  const out: StreamItem[] = [];
  for (const m of course.modules) {
    if (m.done) continue;
    const effort = effortFor(course.id, m.id);
    const source = syllabusSource(m.id);
    for (const lesson of lessonsFor(m)) {
      if (checked.has(lesson.id)) continue;
      const raw = lesson.minutes ?? DEFAULT_TOPIC_MINUTES;
      out.push({
        courseId: course.id,
        moduleId: m.id,
        moduleTitle: m.title,
        title: lesson.title,
        kind: lesson.kind,
        minutes: Math.max(5, Math.round((raw * effort) / 5) * 5),
        source,
      });
    }
  }
  /* The Ship checkpoint packs like content, so it can never overflow a
     block: certificate + evidence written down before the next course. */
  if (out.length) {
    out.push({
      courseId: course.id,
      moduleId: `${course.id}-ship`,
      moduleTitle: "Ship checkpoint",
      title: `Ship: ${course.title} — cert → Portfolio, 3-bullet evidence entry, public post`,
      kind: "app",
      minutes: 30,
      source: "derived",
    });
  }
  return out;
}

const itemType = (kind?: SyllabusItemKind): SessionType =>
  kind === "lab" || kind === "quiz" ? "practice" : kind === "app" ? "apply" : "learn";

function sessionTypeOf(items: PlanItem[]): SessionType {
  const mins: Partial<Record<SessionType, number>> = {};
  for (const it of items) {
    const t = itemType(it.kind);
    mins[t] = (mins[t] ?? 0) + it.minutes;
  }
  return (["apply", "practice", "learn"] as const).reduce((best, t) =>
    (mins[t] ?? 0) > (mins[best] ?? 0) ? t : best
  );
}

function outputOf(type: SessionType, items: PlanItem[]): string {
  if (type === "practice") {
    const named = items.filter((i) => i.kind === "lab" || i.kind === "quiz").map((i) => i.title);
    return `Done when passed: ${named[named.length - 1] ?? "the graded item"}`;
  }
  if (type === "apply") {
    return items.find((i) => i.kind === "app")?.title ?? "The applied artifact, committed";
  }
  return "Output: written notes — 3 takeaways per video, closed-book";
}

function summarize(items: PlanItem[]): string {
  const counts = new Map<string, number>();
  for (const it of items) {
    const label =
      it.kind === "video" ? "videos" : it.kind === "reading" ? "readings" : it.kind === "lab" ? "labs" : it.kind === "quiz" ? "quizzes" : it.kind === "app" ? "applied" : "items";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].map(([k, n]) => (n > 1 ? `${n} ${k}` : k.replace(/s$/, ""))).join(" + ");
}

const stripModulePrefix = (t: string) => t.replace(/^(Week|Module|Course|Unit)\s+\d+\s*[·:]\s*/i, "");

/* ---------------- the generator ---------------- */

export function generateStudyPlan(
  profile: TimelineProfile,
  courses: PlanCourse[],
  capacity: StudyCapacity,
  fromISO: string,
  opts: { checkedLessons?: ReadonlySet<string>; gapProjects?: PlanGap[] } = {}
): StudyPlan {
  const checked = opts.checkedLessons ?? new Set<string>();
  const gaps = opts.gapProjects ?? [];
  const [y, m] = profile.timelineStart.split("-").map(Number);
  const horizon = new Date(Date.UTC(y, m - 1 + profile.timelineMonths, 1)).toISOString().slice(0, 10);

  const active = courses.filter((c) => c.status !== "completed" && c.durationWeeks != null);
  const mainChain = active.filter((c) => !isWarmupPhase(c.phase)).sort(chainOrder);
  const deepChain = active.filter((c) => isWarmupPhase(c.phase)).sort(chainOrder);

  /** Pack one track. `reserved` minutes (retrieval folds) shrink those
      days' content capacity; course boundaries never share a day. */
  function packTrack(
    chain: PlanCourse[],
    owner: "main" | "deep",
    slot: number,
    reserved: ReadonlyMap<string, number>
  ) {
    const sessions: PlanSession[] = [];
    const moduleEnd = new Map<string, string>();
    const courseEnd = new Map<string, string>();
    const counters = new Map<string, number>();
    let cursor = fromISO;

    for (const course of chain) {
      const stream = courseStream(course, checked);
      if (!stream.length) continue;
      const start = courseStartISO(profile, course);
      if (start && start > cursor) cursor = start;

      let i = 0;
      let carry = 0; // minutes of stream[i] already scheduled
      while (i < stream.length && cursor < horizon) {
        if ((dow(cursor) === 0 ? "deep" : dow(cursor) === 6 ? "project" : "main") !== owner) {
          cursor = addDaysISO(cursor, 1);
          continue;
        }
        let room = slot - (reserved.get(`${owner}:${cursor}`) ?? 0);
        const firstIdx = i;
        const items: PlanItem[] = [];
        while (i < stream.length && room >= 5) {
          const it = stream[i];
          const remaining = it.minutes - carry;
          const take = Math.min(remaining, room);
          items.push({
            title: it.title,
            kind: it.kind,
            minutes: take,
            part: remaining > take ? (carry ? "cont." : "start") : carry ? "finish" : undefined,
          });
          room -= take;
          if (take < remaining) {
            carry += take;
            break;
          }
          carry = 0;
          if (!it.moduleId.endsWith("-ship")) moduleEnd.set(it.moduleId, cursor);
          courseEnd.set(course.id, cursor);
          i++;
        }
        if (items.length) {
          const anchor = stream[firstIdx];
          const moduleId = anchor.moduleId;
          const moduleTitle = anchor.moduleTitle;
          const n = (counters.get(moduleId) ?? 0) + 1;
          counters.set(moduleId, n);
          const type: SessionType = moduleId.endsWith("-ship") ? "ship" : sessionTypeOf(items);
          sessions.push({
            id: `${moduleId}-s${String(n).padStart(2, "0")}`,
            date: cursor,
            courseId: course.id,
            gapProjectId: null,
            moduleId,
            title: type === "ship" ? items[0].title : `${stripModulePrefix(moduleTitle)} — ${summarize(items)}`,
            type,
            minutes: items.reduce((s, it) => s + it.minutes, 0),
            items,
            output: type === "ship" ? "Portfolio/Completions updated; something public exists" : outputOf(type, items),
            source: syllabusSource(moduleId),
          });
        }
        cursor = addDaysISO(cursor, 1);
      }
    }
    return { sessions, moduleEnd, courseEnd };
  }

  /* Pass 1: pack content with full blocks to learn where modules end. */
  const none = new Map<string, number>();
  const p1main = packTrack(mainChain, "main", capacity.mainMinutes, none);
  const p1deep = packTrack(deepChain, "deep", capacity.deepMinutes, none);

  /* Spaced retrieval: +1/+7/+30 days after each module's content ends,
     folded into that track's next block (fixed dates from pass 1). */
  const reserved = new Map<string, number>();
  const retrievals: { date: string; owner: "main" | "deep"; moduleId: string; moduleTitle: string; courseId: string; k: number }[] = [];
  const titles = new Map<string, { title: string; courseId: string }>();
  for (const chain of [mainChain, deepChain]) {
    for (const c of chain) for (const mod of c.modules) titles.set(mod.id, { title: mod.title, courseId: c.id });
  }
  for (const [pass, owner] of [
    [p1main, "main"],
    [p1deep, "deep"],
  ] as const) {
    for (const [moduleId, endDate] of pass.moduleEnd) {
      const meta = titles.get(moduleId);
      if (!meta) continue;
      capacity.retrievalOffsets.forEach((offset, k) => {
        let d = addDaysISO(endDate, offset);
        if (d >= horizon) return;
        while ((dow(d) === 0 ? "deep" : dow(d) === 6 ? "project" : "main") !== owner) d = addDaysISO(d, 1);
        const key = `${owner}:${d}`;
        reserved.set(key, (reserved.get(key) ?? 0) + capacity.retrievalMinutes);
        retrievals.push({ date: d, owner, moduleId, moduleTitle: meta.title, courseId: meta.courseId, k: k + 1 });
      });
    }
  }

  /* Pass 2: the real packing, with retrieval capacity carved out. */
  const p2main = packTrack(mainChain, "main", capacity.mainMinutes, reserved);
  const p2deep = packTrack(deepChain, "deep", capacity.deepMinutes, reserved);
  const sessions: PlanSession[] = [...p2main.sessions, ...p2deep.sessions];

  /* Attach retrieval items to the session on their day, or emit a
     standalone recall session when the track is quiet that day. */
  const byDayTrack = new Map<string, PlanSession>();
  for (const s of sessions) byDayTrack.set(`${dow(s.date) === 0 ? "deep" : "main"}:${s.date}`, s);
  for (const ret of retrievals) {
    const item: PlanItem = {
      title: `Recall (${ret.k === 1 ? "+1d" : ret.k === 2 ? "+7d" : "+30d"}): ${stripModulePrefix(ret.moduleTitle)} — closed book, write then check`,
      kind: "quiz",
      minutes: capacity.retrievalMinutes,
    };
    const host = byDayTrack.get(`${ret.owner}:${ret.date}`);
    if (host) {
      host.items.unshift(item);
      host.minutes += item.minutes;
    } else {
      sessions.push({
        id: `${ret.moduleId}-r${ret.k}`,
        date: ret.date,
        courseId: ret.courseId,
        gapProjectId: null,
        moduleId: ret.moduleId,
        title: item.title,
        type: "retrieve",
        minutes: item.minutes,
        items: [item],
        output: "Output: written recall, checked against notes",
        source: null,
      });
    }
  }

  /* Saturday project track. */
  const gapById = new Map(gaps.map((g) => [g.id, g]));
  for (const win of PROJECT_WINDOWS) {
    const gap = gapById.get(win.id);
    if (!gap || gap.status === "shipped") continue;
    const arc = PROJECT_ARCS[win.id] ?? [];
    let n = 0;
    for (const d of ownedDays(win.from < fromISO ? fromISO : win.from, win.to > horizon ? horizon : win.to, "project")) {
      const focus = arc[n] ?? `Iterate: ${arc[arc.length - 1] ?? gap.title}`;
      n++;
      const shipish = /publish|write-up|evidence|per release|ship to/i.test(focus);
      sessions.push({
        id: `${win.id}-s${String(n).padStart(2, "0")}`,
        date: d,
        courseId: null,
        gapProjectId: win.id,
        moduleId: null,
        title: `${gap.title}: ${focus}`,
        type: shipish ? "ship" : "apply",
        minutes: capacity.projectMinutes,
        items: [{ title: focus, kind: "app", minutes: capacity.projectMinutes }],
        output: focus,
        source: "derived",
      });
    }
  }

  /* Reserved-but-open blocks: buffer before the wave, application blocks
     after it (the wave date IS the profile target date). */
  const sessionDays = new Set(sessions.map((s) => `${s.date}`));
  const wave = profile.targetDate;
  for (const owner of ["main", "project", "deep"] as const) {
    const slot = owner === "main" ? capacity.mainMinutes : owner === "project" ? capacity.projectMinutes : capacity.deepMinutes;
    for (const d of ownedDays(fromISO, horizon, owner)) {
      if (sessionDays.has(d)) continue;
      const inWave = d >= wave;
      if (owner === "main" && inWave && !["1", "3", "5"].includes(String(dow(d)))) continue; // Mon/Wed/Fri only
      sessions.push({
        id: `open-${owner}-${d}`,
        date: d,
        courseId: null,
        gapProjectId: null,
        moduleId: null,
        title: inWave
          ? "Application block: send + follow up (15–20/wk wave)"
          : "Open block: catch-up or get ahead",
        type: "open",
        minutes: slot,
        items: [],
        output: inWave ? "Applications logged in the tracker" : "Backlog drained",
        source: null,
      });
      sessionDays.add(d);
    }
  }

  sessions.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id.localeCompare(b.id)));

  /* ---------------- diagnostics ---------------- */

  const courseLoads: CourseLoad[] = active.map((c) => {
    const minutes = courseStream(c, checked).reduce((s, it) => s + it.minutes, 0);
    const start = courseStartISO(profile, c);
    const targetEnd = courseEndISO(profile, c);
    const owner = isWarmupPhase(c.phase) ? "deep" : "main";
    const slot = owner === "deep" ? capacity.deepMinutes : capacity.mainMinutes;
    const windowMinutes =
      start && targetEnd
        ? Array.from(ownedDays(start < fromISO ? fromISO : start, targetEnd, owner)).length * slot
        : 0;
    const packedEnd = (owner === "deep" ? p2deep : p2main).courseEnd.get(c.id) ?? null;
    const overrunDays =
      packedEnd && targetEnd && packedEnd > targetEnd
        ? Math.round((Date.parse(packedEnd) - Date.parse(targetEnd)) / 86_400_000)
        : 0;
    return { courseId: c.id, title: c.title, minutes, windowMinutes, packedEnd, targetEnd, overrunDays };
  });

  const byWeek = new Map<string, WeekLoad>();
  for (const s of sessions) {
    if (s.type === "open") continue; // reserved, not scheduled work
    const ws = weekStartOf(s.date);
    let w = byWeek.get(ws);
    if (!w) {
      w = { weekStart: ws, minutes: 0, byType: { learn: 0, practice: 0, apply: 0, retrieve: 0, ship: 0, open: 0 }, learnShare4w: 0 };
      byWeek.set(ws, w);
    }
    for (const it of s.items.length ? s.items : [{ title: s.title, kind: undefined, minutes: s.minutes } as PlanItem]) {
      const t =
        s.type === "retrieve" || (it.kind === "quiz" && it.title.startsWith("Recall")) ? "retrieve"
        : s.type === "ship" ? "ship"
        : s.type === "apply" && s.gapProjectId ? "apply"
        : itemType(it.kind);
      w.byType[t] += it.minutes;
      w.minutes += it.minutes;
    }
  }
  const weeks = [...byWeek.values()].sort((a, b) => (a.weekStart < b.weekStart ? -1 : 1));
  const ratioViolations: StudyPlan["ratioViolations"] = [];
  weeks.forEach((w, idx) => {
    const window = weeks.slice(Math.max(0, idx - 3), idx + 1);
    const total = window.reduce((s, x) => s + x.minutes, 0);
    const learn = window.reduce((s, x) => s + x.byType.learn, 0);
    w.learnShare4w = total ? learn / total : 0;
    if (total > 0 && w.learnShare4w > capacity.learnCap) {
      ratioViolations.push({ weekStart: w.weekStart, learnShare: w.learnShare4w });
    }
  });

  return { sessions, courseLoads, weeks, ratioViolations };
}
