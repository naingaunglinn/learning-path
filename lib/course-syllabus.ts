/* ------------------------------------------------------------------ */
/* Item-level syllabus detail: the actual videos, readings, labs and   */
/* quizzes inside a module, grouped into the same sections the         */
/* Coursera player shows. Static content keyed by seed module id —     */
/* modules without an entry fall back to their topic list              */
/* (lib/module-topics.ts) rendered as plain items.                     */
/*                                                                     */
/* Sources: co-genai-llms is a 1:1 transcription from the enrolled     */
/* player (2026-08); everything else was transcribed from published    */
/* coursera.org syllabi in the 2026-08-14 research pass, condensed by  */
/* fixed rules (admin/promo items dropped, all real work kept with its */
/* listed minutes). Authored Apply/self-study modules are `derived`.   */
/* ------------------------------------------------------------------ */

import type { SyllabusSection } from "./syllabus/kit";
import { GENAI_LLMS_SYLLABUS } from "./syllabus/genai-llms";
import { WARMUP_SYLLABUS } from "./syllabus/warmup";
import { MAIN_PATH_SYLLABUS } from "./syllabus/main-path";
import { RAG_CERT_SYLLABUS } from "./syllabus/rag-cert";

export type { SyllabusItem, SyllabusItemKind, SyllabusSection } from "./syllabus/kit";

export const DETAILED_SYLLABUS: Record<string, SyllabusSection[]> = {
  ...GENAI_LLMS_SYLLABUS,
  ...WARMUP_SYLLABUS,
  ...MAIN_PATH_SYLLABUS,
  ...RAG_CERT_SYLLABUS,
};

/* ---------------- provenance ---------------- */

export type SyllabusSource = "verified" | "derived";

/** Modules whose item lists are authored here rather than transcribed
    from a published syllabus — the Apply write-ups and the self-directed
    OWASP pass. Everything else in DETAILED_SYLLABUS is verified. */
const AUTHORED_MODULE_IDS = new Set([
  "co-system-design-m06",
  "co-system-design-m07",
  "co-system-design-m08",
  "co-warmup-db-m05",
  "co-warmup-db-m06",
  "co-warmup-architecture-m05",
  "co-warmup-security-m01",
  "co-warmup-security-m02",
  "co-warmup-security-m03",
  "co-warmup-security-m04",
]);

/** A schedule you can trust at 6 am must say where it came from:
    `verified` = the published syllabus; `derived` = authored breakdown
    (including the topic-list fallback for custom modules). */
export function syllabusSource(moduleId: string): SyllabusSource {
  if (!(moduleId in DETAILED_SYLLABUS)) return "derived";
  return AUTHORED_MODULE_IDS.has(moduleId) ? "derived" : "verified";
}

/* ---------------- effort ---------------- */

/* Coursera hour estimates assume no prior knowledge. Eight years of
   production SQL/Python compress some courses hard; competitive-
   programming assignments expand one. Applied at pack time in
   lib/study-plan.ts — item minutes above stay as listed. */
const MODULE_EFFORT: Record<string, number> = {
  "co-warmup-db-m01": 0.3, // Database Design & Basic SQL — speed-run
  "co-warmup-db-m02": 0.6, // Intermediate PostgreSQL
};
const COURSE_EFFORT: Record<string, number> = {
  "co-python-ai": 0.6,
  "co-warmup-algorithms": 1.2,
};

export function effortFor(courseId: string, moduleId: string): number {
  return MODULE_EFFORT[moduleId] ?? COURSE_EFFORT[courseId] ?? 1;
}
