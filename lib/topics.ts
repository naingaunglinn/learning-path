import type { Course, CourseModule } from "./schemas";
import { MODULE_TOPICS } from "./module-topics";
import { DETAILED_SYLLABUS, type SyllabusItemKind, type SyllabusSection } from "./course-syllabus";

/* ------------------------------------------------------------------ */
/* Lessons: the checkable items inside a module. Content lives in code */
/* — item-level detail (videos/readings/labs, lib/course-syllabus.ts)  */
/* where transcribed, topic lists (lib/module-topics.ts) elsewhere.    */
/* Check state lives in the topicProgress collection, keyed by the     */
/* deterministic lesson id built here (flat index across sections).    */
/* A module with no authored content has no lessons and is checked     */
/* directly.                                                           */
/* ------------------------------------------------------------------ */

export type Lesson = {
  id: string;
  title: string;
  kind?: SyllabusItemKind;
  minutes?: number;
  section?: string;
};

export const lessonIdFor = (moduleId: string, index: number) =>
  `${moduleId}-t${String(index + 1).padStart(2, "0")}`;

/** The module's syllabus as sections — detailed transcription when we
    have one, otherwise the topic list as one plain section. */
export function syllabusFor(moduleId: string): SyllabusSection[] {
  const detailed = DETAILED_SYLLABUS[moduleId];
  if (detailed) return detailed;
  const topics = MODULE_TOPICS[moduleId] ?? [];
  return topics.length ? [{ items: topics.map((title) => ({ title })) }] : [];
}

export type LessonSection = { section?: string; lessons: Lesson[] };

/** The module's lessons grouped by section, ids assigned by flat index. */
export function sectionedLessonsFor(module: Pick<CourseModule, "id">): LessonSection[] {
  const out: LessonSection[] = [];
  let i = 0;
  for (const sec of syllabusFor(module.id)) {
    out.push({
      section: sec.section,
      lessons: sec.items.map((item) => ({
        id: lessonIdFor(module.id, i++),
        title: item.title,
        kind: item.kind,
        minutes: item.minutes,
        section: sec.section,
      })),
    });
  }
  return out;
}

export function lessonsFor(module: Pick<CourseModule, "id">): Lesson[] {
  return sectionedLessonsFor(module).flatMap((s) => s.lessons);
}

export const KIND_LABEL: Record<SyllabusItemKind, string> = {
  video: "Video",
  reading: "Reading",
  lab: "Lab",
  quiz: "Graded quiz",
  app: "App item",
};

export function lessonMeta(lesson: Pick<Lesson, "kind" | "minutes">): string {
  const parts: string[] = [];
  if (lesson.kind) parts.push(KIND_LABEL[lesson.kind]);
  if (lesson.minutes) {
    parts.push(lesson.minutes >= 60 ? `${Math.round(lesson.minutes / 60)} h` : `${lesson.minutes} min`);
  }
  return parts.join(" · ");
}

/** A checked module counts all of its lessons as done — the two states
    converge because module checks stamp lesson rows, but display never
    depends on that. */
export function lessonDone(module: Pick<CourseModule, "done">, checked: Set<string>, lessonId: string): boolean {
  return module.done || checked.has(lessonId);
}

export function lessonProgress(
  course: Pick<Course, "modules">,
  checked: Set<string>
): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const m of course.modules) {
    for (const l of lessonsFor(m)) {
      total++;
      if (lessonDone(m, checked, l.id)) done++;
    }
  }
  return { done, total };
}

export type NextLesson = Lesson & { module: CourseModule; ordinal: number };

/** First unchecked lesson across the course, with its course-wide number. */
export function nextLesson(course: Pick<Course, "modules">, checked: Set<string>): NextLesson | null {
  let ordinal = 0;
  for (const m of course.modules) {
    for (const l of lessonsFor(m)) {
      ordinal++;
      if (!lessonDone(m, checked, l.id)) {
        return { ...l, module: m as CourseModule, ordinal };
      }
    }
  }
  return null;
}
