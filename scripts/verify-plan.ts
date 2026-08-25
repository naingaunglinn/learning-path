/* Study-plan verifier + report printer. Run: npx tsx scripts/verify-plan.ts
   Asserts the detailed-schedule definition of done: deterministic ids,
   full-range coverage, weekly capacity respected, Learn <= 60% of any
   rolling 4-week window, spaced retrieval present, checked work leaves
   the plan. Prints the 12-week load table and the busiest RAG x
   PostgreSQL crossover week. */

import { buildSeedData, seedProfile } from "../lib/seed-data";
import { STUDY_CAPACITY } from "../lib/schedule";
import { generateStudyPlan, type PlanSession } from "../lib/study-plan";
import { lessonsFor } from "../lib/topics";
import { todayISO } from "../lib/dates";

let pass = 0;
let fail = 0;
function ok(name: string, cond: boolean, detail = "") {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}
const h = (min: number) => (min / 60).toFixed(1).padStart(5);

const data = buildSeedData();
const from = todayISO();
const args = [seedProfile, data.courses, STUDY_CAPACITY, from] as const;
const mk = (opts = {}) =>
  generateStudyPlan(args[0], args[1], args[2], args[3], { gapProjects: data.gapProjects, ...opts });

const plan = mk();
const again = mk();

/* -------- asserts -------- */
console.log("asserts:");
ok("deterministic: two runs produce identical output", JSON.stringify(plan) === JSON.stringify(again));
const ids = plan.sessions.map((s) => s.id);
ok("zero duplicate ids", new Set(ids).size === ids.length, `${ids.length - new Set(ids).size} dupes`);

const months = new Set(plan.sessions.map((s) => s.date.slice(0, 7)));
const wanted: string[] = [];
for (let i = 0; i < 18; i++) {
  wanted.push(new Date(Date.UTC(2026, 7 + i, 1)).toISOString().slice(0, 7));
}
ok(
  "continuous coverage Aug 2026 → Jan 2028",
  wanted.every((m) => months.has(m)),
  wanted.filter((m) => !months.has(m)).join(",")
);

const CAP_WEEK = 5 * STUDY_CAPACITY.mainMinutes + STUDY_CAPACITY.projectMinutes + STUDY_CAPACITY.deepMinutes;
const over = plan.weeks.filter((w) => w.minutes > CAP_WEEK);
ok(`no week exceeds capacity (${CAP_WEEK / 60} h)`, over.length === 0, over.map((w) => `${w.weekStart}=${(w.minutes / 60).toFixed(1)}h`).slice(0, 5).join(" "));

ok(
  "Learn ≤ 60% of every rolling 4-week window",
  plan.ratioViolations.length === 0,
  plan.ratioViolations.slice(0, 5).map((v) => `${v.weekStart}=${Math.round(v.learnShare * 100)}%`).join(" ")
);

const recallItems = plan.sessions.flatMap((s) => s.items.filter((i) => i.title.startsWith("Recall")));
const m01Recalls = plan.sessions.filter(
  (s) => s.items.some((i) => i.title.includes("Recall") && i.title.includes("Python Basics")) || (s.id.startsWith("co-python-ai-m01-r"))
);
ok("spaced retrieval exists at scale", recallItems.length >= 60, `${recallItems.length} recall items`);
ok("python M1 gets +1/+7/+30 recalls", m01Recalls.length >= 3, `${m01Recalls.length}`);

/* v13: Cert #1 is done — the completed course must carry its certificate
   and contribute nothing to the forward plan. */
const genai = data.courses.find((c) => c.id === "co-genai-llms")!;
ok(
  "completed course carries its certificate",
  genai.status === "completed" && genai.completedDate === "2026-08-25" && genai.credentialUrl.includes("coursera.org/verify"),
  `${genai.status} ${genai.completedDate} ${genai.credentialUrl}`
);
ok(
  "completed course leaves the plan entirely",
  plan.sessions.every((s) => s.courseId !== "co-genai-llms") &&
    !plan.courseLoads.some((c) => c.courseId === "co-genai-llms")
);

const shifted = mk({}); // same-input control
const later = generateStudyPlan(args[0], args[1], args[2], "2026-09-15", { gapProjects: data.gapProjects });
ok("replan from a later date: nothing before it", later.sessions.every((s) => s.date >= "2026-09-15"));
ok("replan: still zero duplicate ids", new Set(later.sessions.map((s) => s.id)).size === later.sessions.length);
ok("control rerun identical (cache-free purity)", JSON.stringify(shifted) === JSON.stringify(plan));

const python = data.courses.find((c) => c.id === "co-python-ai")!;
const firstFive = lessonsFor(python.modules[0]).slice(0, 5).map((l) => l.id);
const advanced = mk({ checkedLessons: new Set(firstFive) });
const minutesOf = (p: typeof plan) => p.courseLoads.find((c) => c.courseId === "co-python-ai")!.minutes;
ok("checked lessons leave the plan", minutesOf(advanced) < minutesOf(plan), `${minutesOf(plan)} → ${minutesOf(advanced)}`);

const everyTyped = plan.sessions.every((s) => ["learn", "practice", "apply", "retrieve", "ship", "open"].includes(s.type));
ok("every session carries a type", everyTyped);
ok(
  "every scheduled course ends in a Ship checkpoint",
  plan.courseLoads
    .filter((c) => c.packedEnd)
    .every((c) => plan.sessions.some((s) => s.courseId === c.courseId && s.items.some((i) => i.title.startsWith("Ship: "))))
);

/* -------- 12-week table -------- */
console.log("\nfirst 12 weeks (hours, effort-adjusted):");
console.log("  week        total  learn  pract  apply  retr  ship  learn%4w");
for (const w of plan.weeks.slice(0, 12)) {
  console.log(
    `  ${w.weekStart}  ${h(w.minutes)}  ${h(w.byType.learn)}  ${h(w.byType.practice)}  ${h(w.byType.apply)}  ${h(w.byType.retrieve)}  ${h(w.byType.ship)}   ${Math.round(w.learnShare4w * 100)}%`
  );
}

/* -------- course loads -------- */
console.log("\ncourse loads (adjusted content vs window):");
for (const c of plan.courseLoads) {
  const flag = c.overrunDays > 0 ? `  ⚠ overruns target by ${c.overrunDays}d` : "";
  console.log(
    `  ${c.title.slice(0, 44).padEnd(44)} ${h(c.minutes)}h of ${h(c.windowMinutes)}h window  ends ${c.packedEnd ?? "—"} (target ${c.targetEnd ?? "—"})${flag}`
  );
}

/* -------- totals -------- */
const totals: Record<string, number> = {};
for (const w of plan.weeks) for (const [t, m] of Object.entries(w.byType)) totals[t] = (totals[t] ?? 0) + m;
const grand = Object.values(totals).reduce((a, b) => a + b, 0);
console.log(`\ntotal scheduled: ${(grand / 60).toFixed(0)} h — ` + Object.entries(totals).filter(([, m]) => m > 0).map(([t, m]) => `${t} ${(m / 60).toFixed(0)}h (${Math.round((m / grand) * 100)}%)`).join(" · "));

/* -------- the RAG x PostgreSQL crossover week, fully expanded -------- */
const byWeek = new Map<string, PlanSession[]>();
for (const s of plan.sessions) {
  const ws = ((d) => {
    const day = new Date(d + "T00:00:00Z").getUTCDay();
    return new Date(Date.parse(d) - ((day + 6) % 7) * 86_400_000).toISOString().slice(0, 10);
  })(s.date);
  byWeek.set(ws, [...(byWeek.get(ws) ?? []), s]);
}
let cross: [string, PlanSession[]] | null = null;
for (const [ws, ss] of byWeek) {
  const hasRag = ss.some((s) => s.courseId === "co-ibm-rag-agentic");
  const hasPg = ss.some((s) => s.courseId === "co-warmup-db");
  if (hasRag && hasPg) {
    const mins = ss.reduce((t, s) => t + (s.type === "open" ? 0 : s.minutes), 0);
    if (!cross || mins > cross[1].reduce((t, s) => t + (s.type === "open" ? 0 : s.minutes), 0)) cross = [ws, ss];
  }
}
if (cross) {
  console.log(`\nbusiest RAG × PostgreSQL crossover week (${cross[0]}):`);
  for (const s of cross[1].sort((a, b) => a.date.localeCompare(b.date))) {
    if (s.type === "open") continue;
    console.log(`  ${s.date} [${s.type.padEnd(8)}] ${(s.minutes + "m").padStart(5)}  ${s.title}`);
    for (const it of s.items) console.log(`      · ${it.title}${it.part ? ` (${it.part})` : ""} — ${it.minutes}m`);
    console.log(`      → ${s.output}`);
  }
} else {
  console.log("\n(no RAG × PostgreSQL crossover week found)");
}

console.log(`\n${pass}/${pass + fail} asserts passed`);
process.exit(fail ? 1 : 0);
