import type { Course, Profile } from "./schemas";
import { addDaysISO, daysUntil } from "./dates";

/* Coursera Financial Aid mechanics:
   - review takes ~15 days, so applications need a lead time before the
     course's target start month (we use 21 days: review + buffer);
   - approval opens a 180-day completion window;
   - Coursera allows ~11 pending applications at once. */

export const AID_REVIEW_DAYS = 15;
export const AID_WINDOW_DAYS = 180;
export const AID_PENDING_CEILING = 11;
export const AID_APPLY_LEAD_DAYS = 21;

/** YYYY-MM for a 1-based roadmap month index. */
export function monthISOForIndex(profile: Pick<Profile, "timelineStart">, index1: number): string {
  const [y, m] = profile.timelineStart.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + (index1 - 1), 1)).toISOString().slice(0, 7);
}

/** 1-based roadmap index of the current calendar month (may fall outside 1..timelineMonths). */
export function currentMonthIndex(profile: Pick<Profile, "timelineStart">): number {
  const [sy, sm] = profile.timelineStart.split("-").map(Number);
  const now = new Date();
  return (now.getFullYear() - sy) * 12 + (now.getMonth() + 1 - sm) + 1;
}

/** The course's start date: the day-precise replanned date when set,
    otherwise the first day of its target month. Null = unscheduled. */
export function courseStartISO(
  profile: Pick<Profile, "timelineStart">,
  course: Pick<Course, "targetStartMonth"> & { plannedStartDate?: string | null }
): string | null {
  if (course.plannedStartDate) return course.plannedStartDate;
  if (course.targetStartMonth === null) return null;
  return monthISOForIndex(profile, course.targetStartMonth) + "-01";
}

/** Target finish date: start + durationWeeks. Null when either is unset. */
export function courseEndISO(
  profile: Pick<Profile, "timelineStart">,
  course: Pick<Course, "targetStartMonth" | "durationWeeks"> & { plannedStartDate?: string | null }
): string | null {
  const start = courseStartISO(profile, course);
  if (!start || course.durationWeeks === null) return null;
  return addDaysISO(start, course.durationWeeks * 7);
}

/** 1-based week of the course the calendar says we're in (clamped to plan
    length). Null when the course hasn't started or has no plan length. */
export function courseWeekOf(
  profile: Pick<Profile, "timelineStart">,
  course: Pick<Course, "targetStartMonth" | "durationWeeks"> & { plannedStartDate?: string | null }
): number | null {
  const start = courseStartISO(profile, course);
  if (!start || course.durationWeeks === null) return null;
  const elapsed = Math.floor((Date.now() - Date.parse(start)) / (7 * 86_400_000)) + 1;
  if (elapsed < 1) return null;
  return Math.min(elapsed, course.durationWeeks);
}

/** Latest sensible date to file the aid application (start month − 21 days).
    Null once it no longer applies (not aid-funded, already applied, done,
    or the course is unscheduled). */
export function aidApplyByDate(profile: Profile, course: Course): string | null {
  if (!course.aidApplicable || course.status === "completed") return null;
  if (course.financialAidStatus !== "not_applied") return null;
  const start = courseStartISO(profile, course);
  return start ? addDaysISO(start, -AID_APPLY_LEAD_DAYS) : null;
}

type AidFields = Pick<Course, "aidApplicable" | "aidApprovedDate" | "status" | "completedDate">;

/** The 180-day completion deadline. Always derived from aidApprovedDate;
    the stored field is just a persisted copy of this. */
export function aidCompletionDeadline(course: Pick<Course, "aidApplicable" | "aidApprovedDate">): string | null {
  if (!course.aidApplicable) return null;
  return course.aidApprovedDate ? addDaysISO(course.aidApprovedDate, AID_WINDOW_DAYS) : null;
}

/** Re-derive computed fields before persisting. Also stamps completedDate. */
export function withCourseDerivations<T extends AidFields>(course: T): T {
  return {
    ...course,
    completionDeadline: aidCompletionDeadline(course),
    completedDate:
      course.status === "completed"
        ? (course.completedDate ?? new Date().toISOString().slice(0, 10))
        : null,
  };
}

export function pendingAidCount(courses: Course[]): number {
  return courses.filter((c) => c.aidApplicable && c.financialAidStatus === "applied").length;
}

/** True when a derived deadline predates the workspace itself — the user
    never had a chance to meet it, so it must not render as overdue. */
export function isPreWorkspace(
  deadlineISO: string,
  profile: Pick<Profile, "workspaceCreatedAt">
): boolean {
  return deadlineISO < profile.workspaceCreatedAt;
}

export type DeadlineTone = "risk" | "neutral";

/** Days-based urgency: anything inside 30 days (or overdue) renders in #841818. */
export function deadlineTone(iso: string): DeadlineTone {
  return daysUntil(iso) <= 30 ? "risk" : "neutral";
}

export function describeDaysUntil(iso: string): string {
  const d = daysUntil(iso);
  if (d < 0) return `overdue ${Math.abs(d)}d`;
  if (d === 0) return "today";
  return `in ${d}d`;
}
