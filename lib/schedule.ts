import type { Course, Profile } from "./schemas";
import { addDaysISO } from "./dates";
import { courseStartISO } from "./aid";

/* ------------------------------------------------------------------ */
/* Replanning. "Replan from today" anchors the remaining path to a     */
/* date: day 1 of the current course IS that date (a full fresh        */
/* window), the rest of the main path chains back-to-back after it,    */
/* and the Warm-up track chains in parallel. Daily fill                */
/* (lib/calendar.ts) derives one session per day from the resulting    */
/* windows — nothing per-day is stored.                                */
/* ------------------------------------------------------------------ */

/* One subject per day — a second course in the same sitting pays a
   context-switch tax and 30-minute fragments never reach depth:
   Mon–Fri belong to the main path, Saturday to the gap-project track
   (lib/study-plan.ts), and Sunday is the warm-up deep block. Open-ended
   rows, if any return, take the Sunday hour after the warm-up ends. */

export type StudyCapacity = {
  /** Main path: Mon–Fri primary block. */
  mainMinutes: number;
  /** Gap-project track: the Saturday block. */
  projectMinutes: number;
  /** Warm-up track: one Sunday deep block. */
  deepMinutes: number;
  /** Open-ended rows: the Sunday hour once the warm-up track ends. */
  ongoingMinutes: number;
  /** Closed-book recall folded into the head of an existing block. */
  retrievalMinutes: number;
  /** Days after a module's last content session: spaced repetition. */
  retrievalOffsets: number[];
  /** Learn's ceiling share of scheduled minutes in a rolling 4-week window. */
  learnCap: number;
};

/** The one capacity object — call sites must not hardcode these numbers. */
export const STUDY_CAPACITY: StudyCapacity = {
  mainMinutes: 90, // ≈ 7.5 h/week
  projectMinutes: 90, // ≈ 1.5 h/week
  deepMinutes: 180, // ≈ 3 h/week
  ongoingMinutes: 60,
  retrievalMinutes: 12,
  retrievalOffsets: [1, 7, 30],
  learnCap: 0.6,
};

/* Named aliases for the daily-fill + pace copy call sites. */
export const MAIN_DAILY_MINUTES = STUDY_CAPACITY.mainMinutes;
export const WARMUP_BLOCK_MINUTES = STUDY_CAPACITY.deepMinutes;
export const ONGOING_WEEKLY_MINUTES = STUDY_CAPACITY.ongoingMinutes;

export const isWarmupPhase = (phase: string) => phase.toLowerCase().startsWith("warm-up");

type TimelineProfile = Pick<Profile, "timelineStart" | "timelineMonths">;

/* Structural subset so the storage migration can pass raw JSON rows. */
type SchedulableCourse = {
  id: string;
  title: string;
  status: Course["status"];
  phase?: string | null;
  durationWeeks?: number | null;
  targetStartMonth?: number | null;
  plannedStartDate?: string | null;
};

/** Roadmap month index for a date, clamped into the plan's range. */
export function monthIndexForDate(profile: TimelineProfile, iso: string): number {
  const [sy, sm] = profile.timelineStart.split("-").map(Number);
  const [y, m] = iso.slice(0, 7).split("-").map(Number);
  const idx = (y - sy) * 12 + (m - sm) + 1;
  return Math.min(Math.max(idx, 1), profile.timelineMonths);
}

export type ReschedulePatch = {
  id: string;
  patch: { plannedStartDate: string; targetStartMonth: number };
};

/** Recompute day-precise starts so the remaining path flows from `fromISO`.
    Each chain starts with the in-progress course, then every queued course
    follows back-to-back. Completed courses and open-ended rows (no
    durationWeeks) are untouched.

    restartInProgress (default true — the manual "Replan from today"):
    day 1 of the in-progress course IS fromISO, a full fresh window.
    With false (the automatic re-chain after completing/starting a course):
    an underway course keeps its window and only the queue re-chains — so
    finishing early never resets what you're in the middle of. */
export function rescheduleFrom(
  profile: TimelineProfile,
  courses: SchedulableCourse[],
  fromISO: string,
  opts: { restartInProgress?: boolean } = {}
): ReschedulePatch[] {
  const restartInProgress = opts.restartInProgress ?? true;
  const patches: ReschedulePatch[] = [];

  const chains: [SchedulableCourse[], SchedulableCourse[]] = [[], []];
  for (const c of courses) {
    if (c.status === "completed" || c.durationWeeks == null) continue;
    chains[isWarmupPhase(c.phase ?? "") ? 1 : 0].push(c);
  }

  for (const chain of chains) {
    chain.sort(
      (a, b) =>
        Number(b.status === "in_progress") - Number(a.status === "in_progress") ||
        (a.targetStartMonth ?? 99) - (b.targetStartMonth ?? 99) ||
        a.title.localeCompare(b.title)
    );
    let cursor = fromISO;
    for (const c of chain) {
      const existingStart =
        c.status === "in_progress" && !restartInProgress
          ? courseStartISO(profile, {
              targetStartMonth: c.targetStartMonth ?? null,
              plannedStartDate: c.plannedStartDate,
            })
          : null;
      /* An underway start in the past survives an automatic re-chain. */
      const anchor = existingStart && existingStart <= fromISO ? existingStart : cursor;
      const targetStartMonth = monthIndexForDate(profile, anchor);
      if (c.plannedStartDate !== anchor || c.targetStartMonth !== targetStartMonth) {
        patches.push({ id: c.id, patch: { plannedStartDate: anchor, targetStartMonth } });
      }
      const end = addDaysISO(anchor, (c.durationWeeks as number) * 7);
      if (end > cursor) cursor = end;
    }
  }

  return patches;
}
