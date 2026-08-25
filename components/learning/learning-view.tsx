"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, CalendarClock, Check, Play, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fadeUp, staggerParent } from "@/lib/motion";
import type { Course, Profile } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { useCollection, useProfile } from "@/lib/use-collection";
import { courseWeekOf, courseEndISO } from "@/lib/aid";
import { deriveCalendarEvents } from "@/lib/calendar";
import { rescheduleFrom } from "@/lib/schedule";
import { moduleProgress, nextModule } from "@/lib/modules";
import { lessonMeta, lessonProgress, nextLesson } from "@/lib/topics";
import { completeCourse, startCourse, toggleCourseModule, toggleLesson } from "./course-actions";
import { addDaysISO, formatDay, todayISO, weekStartISO } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseCard } from "./course-card";
import { CourseDialog } from "./course-dialog";
import { CalendarView } from "./calendar-view";
import { DayPanel } from "./day-panel";
import { RoadmapView } from "./roadmap-view";

const STATUS_ORDER: Record<Course["status"], number> = {
  in_progress: 0,
  not_started: 1,
  completed: 2,
};

const WEEKLY_GOAL_MINUTES = 720; // ~10 h main path + ~2-3 h warm-up track

type Filters = { inProgress: boolean; completed: boolean; plan: boolean };

/* Main-path courses outrank the parallel Warm-up track for the hero card. */
const isWarmup = (c: Course) => c.phase.toLowerCase().startsWith("warm-up");

function byPathOrder(a: Course, b: Course) {
  return (
    Number(isWarmup(a)) - Number(isWarmup(b)) ||
    (a.targetStartMonth ?? 99) - (b.targetStartMonth ?? 99) ||
    a.title.localeCompare(b.title)
  );
}

/* ------------------------------------------------------------------ */
/* Hero band — the black card owns the page: what to study right now.  */
/* ------------------------------------------------------------------ */

function HeroCourseCard({
  course,
  mode,
  week,
  finish,
  profile,
  onAdd,
}: {
  course: Course | null;
  mode: "now" | "next";
  week: number | null;
  finish: string | null;
  profile: Profile;
  onAdd: () => void;
}) {
  const topicChecks = useCollection("topicProgress");
  const checked = useMemo(() => new Set(topicChecks.map((r) => r.id)), [topicChecks]);

  const prog = course ? moduleProgress(course) : { done: 0, total: 0 };
  const next = course ? nextModule(course) : null;
  const lesson = course ? nextLesson(course, checked) : null;
  const lp = course ? lessonProgress(course, checked) : { done: 0, total: 0 };

  /* One tap ticks the current lesson; cascades check the module and, on
     the last one, complete the course through the shared rules. */
  function checkNextLesson() {
    if (!course || !lesson) return;
    const res = toggleLesson(course, profile, lesson.module, lesson.id);
    if (res.courseCompleted) return;
    if (res.moduleCompleted) toast.success("Module done", { description: lesson.module.title });
    else toast.success("Lesson checked off", { description: lesson.title });
  }

  /* Fallback for courses without an authored lesson list. */
  function checkNextModule() {
    if (!course) return;
    const target = nextModule(course);
    if (!target) return;
    const patch = toggleCourseModule(course, profile, target.id);
    if (patch.status !== "completed") {
      toast.success("Module checked off", { description: target.title });
    }
  }

  return (
    <motion.div variants={fadeUp} className="sm:col-span-2 xl:col-span-2">
      <div className="flex h-full flex-col rounded-xl bg-foreground p-6 text-background">
        <div className="flex items-start justify-between gap-3">
          <span className="text-label text-white/50 uppercase">
            {course ? (mode === "now" ? "Now learning" : "Up next") : "Path complete"}
          </span>
          {course?.url && (
            <a
              href={course.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${course.title} on Coursera`}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white outline-none transition-colors duration-200 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <ArrowUpRight className="size-4" />
            </a>
          )}
        </div>

        {course ? (
          <>
            <Link
              href={`/learning/course?c=${course.id}`}
              className="mt-2 block rounded-sm text-title leading-snug text-white outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {course.title}
            </Link>
            <div className="mt-1 text-body-sm text-white/60">
              {course.provider}
              {course.duration && ` · ${course.duration}`}
              {mode === "now" && week && course.durationWeeks && ` · wk ${week} of ${course.durationWeeks}`}
            </div>
            {mode === "now" && lesson && (
              <button
                type="button"
                onClick={checkNextLesson}
                title="Click when this lesson is finished"
                className={cn(
                  "group mt-4 flex w-full items-center gap-3 rounded-lg bg-white/[0.07] px-3 py-2.5 text-left outline-none",
                  "transition-colors duration-200 hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-white/60"
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-white/35 transition-colors duration-200 group-hover:border-green" />
                <span className="min-w-0 flex-1">
                  <span className="block text-label text-white/45 uppercase">
                    Next lesson · {lp.done}/{lp.total} done
                  </span>
                  <span className="mt-0.5 block truncate text-body-sm text-white">
                    <span className="text-white/50 tabular-nums">
                      {String(lesson.ordinal).padStart(2, "0")}
                    </span>{" "}
                    · {lesson.title}
                  </span>
                  <span className="mt-0.5 block truncate text-meta text-white/40">
                    {[lessonMeta(lesson), lesson.module.title].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </button>
            )}
            {mode === "now" && !lesson && next && (
              <button
                type="button"
                onClick={checkNextModule}
                title="Click when this module is finished"
                className={cn(
                  "group mt-4 flex w-full items-center gap-3 rounded-lg bg-white/[0.07] px-3 py-2.5 text-left outline-none",
                  "transition-colors duration-200 hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-white/60"
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-white/35 transition-colors duration-200 group-hover:border-green" />
                <span className="min-w-0 flex-1">
                  <span className="block text-label text-white/45 uppercase">
                    Next module · {prog.done}/{prog.total} done
                  </span>
                  <span className="mt-0.5 block truncate text-body-sm text-white">{next.title}</span>
                </span>
              </button>
            )}
            <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-5">
              {mode === "now" ? (
                <Button variant="accent" size="sm" onClick={() => course && completeCourse(course, profile)}>
                  <Check data-icon="inline-start" /> Mark completed
                </Button>
              ) : (
                <Button variant="accent" size="sm" onClick={() => course && startCourse(course, profile)}>
                  <Play data-icon="inline-start" /> Start course
                </Button>
              )}
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="text-white/70 hover:bg-white/10 hover:text-white"
              >
                <Link href={`/learning/course?c=${course.id}`}>
                  Course details <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              {finish && (
                <span className="text-meta text-white/50 tabular-nums">
                  target finish {formatDay(finish)}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mt-2 text-title leading-snug text-white">
              Every course on the path is done.
            </div>
            <div className="mt-auto pt-5">
              <Button variant="accent" size="sm" onClick={onAdd}>
                <Plus data-icon="inline-start" /> Add what’s next
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  unit,
  fraction,
  sub,
}: {
  label: string;
  value: string;
  unit: string;
  fraction: number; // 0..1 for the green bar
  sub: string;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="h-full">
        <CardContent className="flex h-full flex-col">
          <div className="text-label text-muted-foreground uppercase">{label}</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-display tabular-nums">{value}</span>
            <span className="text-body-sm text-muted-foreground">{unit}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
            <div
              className="h-full rounded-full bg-green transition-[width] duration-500"
              style={{ width: `${Math.round(Math.min(1, Math.max(0, fraction)) * 100)}%` }}
            />
          </div>
          <div className="mt-2 truncate text-meta text-muted-foreground" title={sub}>
            {sub}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

function FilterPill({
  value,
  label,
  pressed,
  onToggle,
}: {
  value: string;
  label: string;
  pressed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      title={pressed ? `Click to hide ${label} on the calendar` : `Click to show ${label}`}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-full px-3 outline-none transition-colors duration-200",
        "focus-visible:ring-2 focus-visible:ring-ring/60",
        pressed ? "bg-card text-foreground" : "text-subtle line-through hover:bg-card/60"
      )}
    >
      <span className="text-meta font-semibold tabular-nums">{value}</span>
      <span className="text-meta text-muted-foreground">{label}</span>
    </button>
  );
}

export function LearningView() {
  const profile = useProfile();
  const courses = useCollection("courses");
  const milestones = useCollection("milestones");
  const critical = useCollection("critical");
  const dayEvents = useCollection("dayEvents");
  const topicProgress = useCollection("topicProgress");
  const gapProjects = useCollection("gapProjects");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [dialog, setDialog] = useState<{ open: boolean; course: Course | null }>({
    open: false,
    course: null,
  });
  const [view, setView] = useState<"calendar" | "roadmap">("calendar");
  const [filters, setFilters] = useState<Filters>({ inProgress: true, completed: true, plan: true });
  const [selected, setSelected] = useState<string | null>(() => {
    const d = searchParams.get("d");
    return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  });

  const inProgress = courses.filter((c) => c.status === "in_progress");
  const completed = courses.filter((c) => c.status === "completed");

  /* Hero: the course to work on now, or the next one to start. */
  const current = [...inProgress].sort(byPathOrder)[0] ?? null;
  const upNext = courses.filter((c) => c.status === "not_started").sort(byPathOrder)[0] ?? null;
  const heroCourse = current ?? upNext;
  const heroMode: "now" | "next" = current ? "now" : "next";

  /* Study minutes logged this week (Mon–Sun). */
  const weekStart = weekStartISO();
  const weekEnd = addDaysISO(weekStart, 6);
  const weekMinutes = dayEvents
    .filter((e) => e.kind === "study" && e.date >= weekStart && e.date <= weekEnd)
    .reduce((sum, e) => sum + (e.minutes ?? 0), 0);
  const studyDays = new Set(
    dayEvents.filter((e) => e.kind === "study" && e.date >= weekStart && e.date <= weekEnd).map((e) => e.date)
  ).size;

  const unscheduled = courses.filter((c) => c.targetStartMonth === null).sort(byPathOrder);

  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const events = useMemo(
    () => deriveCalendarEvents({ courses, milestones, critical, dayEvents, topicProgress, gapProjects, profile }),
    [courses, milestones, critical, dayEvents, topicProgress, gapProjects, profile]
  );
  const visibleEvents = useMemo(
    () =>
      events.filter((e) => {
        if (e.type === "milestone" || e.type === "critical" || e.type === "aid_apply" || e.type === "aid_deadline")
          return filters.plan;
        const course = e.courseId ? courseById.get(e.courseId) : null;
        if (course) return course.status === "completed" ? filters.completed : filters.inProgress;
        return true; // unlinked study blocks and notes
      }),
    [events, filters, courseById]
  );

  const openEdit = (course: Course) => setDialog({ open: true, course });
  const openAdd = () => setDialog({ open: true, course: null });
  const toggle = (key: keyof Filters) => setFilters((f) => ({ ...f, [key]: !f[key] }));

  /* Re-anchor every remaining course so the daily plan flows from today. */
  function replan() {
    const patches = rescheduleFrom(profile, courses, todayISO());
    for (const { id, patch } of patches) stores.courses.update(id, patch);
    logActivity("updated", "Path replanned from today");
    toast.success("Path replanned", {
      description:
        patches.length === 0
          ? "Everything already flows from today."
          : `${patches.length} course${patches.length === 1 ? "" : "s"} re-anchored — day 1 of the current course is today.`,
    });
  }

  /* Selection owns the ?d= deep link — /learning?d=2026-08-12 opens that day. */
  const handleSelect = useCallback(
    (date: string | null) => {
      setSelected(date);
      router.replace(date ? `/learning?d=${date}` : "/learning", { scroll: false });
    },
    [router]
  );

  return (
    <div className="space-y-5">
      <motion.div
        variants={staggerParent}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <HeroCourseCard
          course={heroCourse}
          mode={heroMode}
          week={heroCourse ? courseWeekOf(profile, heroCourse) : null}
          finish={heroCourse ? courseEndISO(profile, heroCourse) : null}
          profile={profile}
          onAdd={openAdd}
        />
        <StatCard
          label="Path progress"
          value={String(completed.length)}
          unit={`of ${courses.length} courses`}
          fraction={courses.length ? completed.length / courses.length : 0}
          sub={upNext ? `next up: ${upNext.title}` : "nothing queued"}
        />
        <StatCard
          label="Study this week"
          value={(weekMinutes / 60).toFixed(1).replace(/\.0$/, "")}
          unit="of 12 h"
          fraction={weekMinutes / WEEKLY_GOAL_MINUTES}
          sub={
            weekMinutes === 0
              ? "log time from any calendar day"
              : `across ${studyDays} day${studyDays === 1 ? "" : "s"} · Mon–Sun`
          }
        />
      </motion.div>

      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList className="h-8 bg-card">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>
        </Tabs>
        {view === "calendar" && (
          <div className="flex items-center gap-1">
            <FilterPill
              value={String(inProgress.length)}
              label="in progress"
              pressed={filters.inProgress}
              onToggle={() => toggle("inProgress")}
            />
            <FilterPill
              value={`${completed.length}/${courses.length}`}
              label="completed"
              pressed={filters.completed}
              onToggle={() => toggle("completed")}
            />
            <FilterPill
              value={String(milestones.length)}
              label="milestones"
              pressed={filters.plan}
              onToggle={() => toggle("plan")}
            />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={replan}
            title="Re-anchor every remaining course so the daily plan flows from today"
          >
            <CalendarClock data-icon="inline-start" /> Replan from today
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus data-icon="inline-start" /> Add course
          </Button>
        </div>
      </div>

      {courses.length === 0 && (
        <Card size="sm">
          <CardContent className="text-body-sm text-muted-foreground">
            No courses scheduled. Add one, or open Roadmap to see the 18-month plan.
          </CardContent>
        </Card>
      )}

      {unscheduled.length > 0 && (
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          aria-label="Unscheduled courses"
          className="space-y-2"
        >
          <div className="text-label text-muted-foreground uppercase">
            Unscheduled — pick a start month to place it on the path
          </div>
          <AnimatePresence initial={false}>
            {unscheduled.map((course) => (
              <CourseCard key={course.id} course={course} profile={profile} onEdit={() => openEdit(course)} />
            ))}
          </AnimatePresence>
        </motion.section>
      )}

      {view === "calendar" ? (
        <div
          className={cn(
            "grid items-start gap-4",
            selected ? "xl:grid-cols-[minmax(0,1fr)_320px]" : "grid-cols-1"
          )}
        >
          <Card>
            <CardContent>
              <CalendarView events={visibleEvents} selected={selected} onSelect={handleSelect} />
            </CardContent>
          </Card>
          <AnimatePresence>
            {selected && (
              <DayPanel
                key={selected}
                date={selected}
                events={visibleEvents.filter((e) => e.date === selected)}
                courses={courses}
                onClose={() => handleSelect(null)}
                onEditCourse={openEdit}
              />
            )}
          </AnimatePresence>
        </div>
      ) : (
        <RoadmapView profile={profile} courses={courses} onEdit={openEdit} />
      )}

      <CourseDialog
        open={dialog.open}
        course={dialog.course}
        profile={profile}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
    </div>
  );
}
