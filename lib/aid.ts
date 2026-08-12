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
export function monthISOForIndex(profile: Profile, index1: number): string {
  const [y, m] = profile.timelineStart.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + (index1 - 1), 1)).toISOString().slice(0, 7);
}

/** 1-based roadmap index of the current calendar month (may fall outside 1..timelineMonths). */
export function currentMonthIndex(profile: Profile): number {
  const [sy, sm] = profile.timelineStart.split("-").map(Number);
  const now = new Date();
  return (now.getFullYear() - sy) * 12 + (now.getMonth() + 1 - sm) + 1;
}

/** First day of the course's target start month. */
export function courseStartISO(profile: Profile, course: Pick<Course, "targetStartMonth">): string {
  return monthISOForIndex(profile, course.targetStartMonth) + "-01";
}

/** Latest sensible date to file the aid application (start month − 21 days).
    Null once it no longer applies (not aid-funded, already applied, or done). */
export function aidApplyByDate(profile: Profile, course: Course): string | null {
  if (!course.aidApplicable || course.status === "completed") return null;
  if (course.financialAidStatus !== "not_applied") return null;
  return addDaysISO(courseStartISO(profile, course), -AID_APPLY_LEAD_DAYS);
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

export type DeadlineTone = "risk" | "muted";

/** Days-based urgency: anything inside 30 days (or overdue) renders in #841818. */
export function deadlineTone(iso: string): DeadlineTone {
  return daysUntil(iso) <= 30 ? "risk" : "muted";
}

export function describeDaysUntil(iso: string): string {
  const d = daysUntil(iso);
  if (d < 0) return `overdue ${Math.abs(d)}d`;
  if (d === 0) return "today";
  return `in ${d}d`;
}
