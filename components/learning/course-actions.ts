"use client";

import { toast } from "sonner";
import type { Course, CourseModule, Profile } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { withCourseDerivations } from "@/lib/aid";
import { rescheduleFrom } from "@/lib/schedule";
import { completeAllModules, toggleModulePatch } from "@/lib/modules";
import { lessonsFor } from "@/lib/topics";
import { todayISO } from "@/lib/dates";

/* ------------------------------------------------------------------ */
/* One place for every course write the Learning views share — the     */
/* course card, the hero band, and the course detail page must apply   */
/* identical rules or their behavior drifts apart.                     */
/* ------------------------------------------------------------------ */

/** Pull the queue forward so the next course's daily plan starts
    immediately; underway courses keep their window. */
export function rechainQueue(profile: Profile) {
  const patches = rescheduleFrom(profile, stores.courses.list(), todayISO(), {
    restartInProgress: false,
  });
  for (const { id, patch } of patches) stores.courses.update(id, patch);
}

/** Upsert/remove one lesson-check row (row id = lesson id). */
function setLessonChecked(lessonId: string, checked: boolean) {
  const existing = stores.topicProgress.get(lessonId);
  if (checked && !existing) {
    stores.topicProgress.create({ id: lessonId, completedDate: todayISO(), tags: [] });
  } else if (!checked && existing) {
    stores.topicProgress.remove(lessonId);
  }
}

function setModuleLessons(module: CourseModule, checked: boolean) {
  for (const l of lessonsFor(module)) setLessonChecked(l.id, checked);
}

export function completeCourse(course: Course, profile: Profile) {
  stores.courses.update(
    course.id,
    withCourseDerivations({ ...course, status: "completed", modules: completeAllModules(course) })
  );
  for (const m of course.modules) setModuleLessons(m, true);
  rechainQueue(profile);
  logActivity("completed", `Course completed: ${course.title}`);
  toast.success("Course completed", {
    description: "Counted in Portfolio → Learning completions. The next course starts now.",
  });
}

export function startCourse(course: Course, profile: Profile) {
  stores.courses.update(course.id, { status: "in_progress" });
  rechainQueue(profile);
  logActivity("updated", `Course started: ${course.title}`);
  toast.success("Course started");
}

export function reopenCourse(course: Course) {
  stores.courses.update(course.id, withCourseDerivations({ ...course, status: "in_progress" }));
  logActivity("updated", `Course reopened: ${course.title}`);
  toast("Back in progress");
}

/** Toggle one syllabus module, with its status side-effects: the first
    check on a queued course starts it, checking the last one completes
    it, unchecking on a completed course reopens it. syncTopics (default
    true — the direct circle click) stamps or clears the module's lesson
    rows; lesson-driven toggles pass false so unchecking one lesson never
    wipes its siblings. Returns the applied patch so callers can layer
    their own feedback on plain checks. */
export function toggleCourseModule(
  course: Course,
  profile: Profile,
  moduleId: string,
  opts: { syncTopics?: boolean } = {}
): Partial<Course> {
  const patch = toggleModulePatch(course, moduleId);
  stores.courses.update(course.id, withCourseDerivations({ ...course, ...patch }));
  const target = course.modules.find((m) => m.id === moduleId);
  if (target && (opts.syncTopics ?? true)) {
    setModuleLessons(target, !target.done);
  }
  if (patch.status === "completed") {
    rechainQueue(profile);
    logActivity("completed", `Course completed: ${course.title}`);
    toast.success("All modules done — course completed", {
      description: "Counted in Portfolio → Learning completions. The next course starts now.",
    });
  } else if (patch.status === "in_progress" && course.status === "not_started") {
    rechainQueue(profile);
    logActivity("updated", `Course started: ${course.title}`);
  } else if (target && !target.done) {
    logActivity("updated", `Module done: ${target.title} (${course.title})`);
  }
  return patch;
}

export type LessonToggleResult = {
  checked: boolean;
  moduleCompleted: boolean;
  courseCompleted: boolean;
};

/** Toggle one lesson. Checking the module's last lesson checks the module
    (which can complete the course); unchecking a lesson on a checked
    module reopens the module (and the course, if it was completed). */
export function toggleLesson(
  course: Course,
  profile: Profile,
  module: CourseModule,
  lessonId: string
): LessonToggleResult {
  const was = module.done || !!stores.topicProgress.get(lessonId);
  if (!was) {
    setLessonChecked(lessonId, true);
    logActivity("updated", `Lesson done: ${lessonsFor(module).find((l) => l.id === lessonId)?.title ?? lessonId}`);
    const allDone = lessonsFor(module).every((l) => !!stores.topicProgress.get(l.id));
    if (allDone && !module.done) {
      const patch = toggleCourseModule(course, profile, module.id, { syncTopics: false });
      return { checked: true, moduleCompleted: true, courseCompleted: patch.status === "completed" };
    }
    return { checked: true, moduleCompleted: false, courseCompleted: false };
  }
  /* Unchecking: keep the siblings checked (stamp them first — a module
     checked before lessons existed has no rows), reopen the module, and
     drop just this lesson. */
  if (module.done) {
    for (const l of lessonsFor(module)) if (l.id !== lessonId) setLessonChecked(l.id, true);
    toggleCourseModule(course, profile, module.id, { syncTopics: false });
  }
  setLessonChecked(lessonId, false);
  return { checked: false, moduleCompleted: false, courseCompleted: false };
}
