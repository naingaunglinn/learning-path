import type { Course, CourseModule } from "./schemas";
import { todayISO } from "./dates";

/* ------------------------------------------------------------------ */
/* Course syllabus checklist — pure patch builders so the course card, */
/* the hero band, and the dialog all apply identical rules.            */
/* ------------------------------------------------------------------ */

export function moduleProgress(course: Pick<Course, "modules">): { done: number; total: number } {
  return {
    done: course.modules.filter((m) => m.done).length,
    total: course.modules.length,
  };
}

/** First unchecked module — what to work on next. */
export function nextModule(course: Pick<Course, "modules">): CourseModule | null {
  return course.modules.find((m) => !m.done) ?? null;
}

/** Patch for toggling one module, with its status side-effects:
    the first check on a queued course starts it, checking the last one
    completes it, and unchecking on a completed course reopens it. */
export function toggleModulePatch(course: Course, moduleId: string): Partial<Course> {
  const modules = course.modules.map((m) =>
    m.id === moduleId ? { ...m, done: !m.done, completedDate: m.done ? null : todayISO() } : m
  );
  const allDone = modules.length > 0 && modules.every((m) => m.done);
  const checked = modules.find((m) => m.id === moduleId)?.done ?? false;

  const patch: Partial<Course> = { modules };
  if (allDone) {
    patch.status = "completed";
    patch.completedDate = course.completedDate ?? todayISO();
  } else if (course.status === "completed") {
    patch.status = "in_progress";
    patch.completedDate = null;
  } else if (checked && course.status === "not_started") {
    patch.status = "in_progress";
  }
  return patch;
}

/** Check every module — used when the course itself is marked completed. */
export function completeAllModules(
  course: Pick<Course, "modules" | "completedDate">
): CourseModule[] {
  const stamp = course.completedDate ?? todayISO();
  return course.modules.map((m) => (m.done ? m : { ...m, done: true, completedDate: stamp }));
}
