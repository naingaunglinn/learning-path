"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  Check,
  ChevronDown,
  Pencil,
  Play,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fadeUp, staggerParent } from "@/lib/motion";
import type { Course, CourseModule } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { useCollection, useProfile } from "@/lib/use-collection";
import { courseEndISO, courseStartISO, courseWeekOf, monthISOForIndex } from "@/lib/aid";
import {
  isWarmupPhase,
  MAIN_DAILY_MINUTES,
  ONGOING_WEEKLY_MINUTES,
  WARMUP_BLOCK_MINUTES,
} from "@/lib/schedule";
import { moduleProgress, nextModule } from "@/lib/modules";
import {
  lessonDone,
  lessonMeta,
  lessonProgress,
  lessonsFor,
  nextLesson,
  sectionedLessonsFor,
} from "@/lib/topics";
import { daysUntil, formatDate, formatDay, formatMonth, todayISO } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Chip } from "@/components/shared/chip";
import { CourseDialog } from "./course-dialog";
import {
  completeCourse,
  reopenCourse,
  startCourse,
  toggleCourseModule,
  toggleLesson,
} from "./course-actions";

const isWarmup = (c: Course) => isWarmupPhase(c.phase);

/* Same ordering the Learning hero uses: main path first, then by month. */
function byPathOrder(a: Course, b: Course) {
  return (
    Number(isWarmup(a)) - Number(isWarmup(b)) ||
    (a.targetStartMonth ?? 99) - (b.targetStartMonth ?? 99) ||
    a.title.localeCompare(b.title)
  );
}

function FactRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "risk";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <dt className="text-meta text-muted-foreground">{label}</dt>
      <dd className={cn("text-right text-body-sm font-medium tabular-nums", tone === "risk" && "text-risk")}>
        {value}
      </dd>
    </div>
  );
}

export function CourseDetail() {
  const profile = useProfile();
  const courses = useCollection("courses");
  const dayEvents = useCollection("dayEvents");
  const topicChecks = useCollection("topicProgress");
  const params = useSearchParams();
  const id = params.get("c");
  const [editOpen, setEditOpen] = useState(false);
  /* Accordions: manual open/closed choices per module and per section,
     on top of the default "only what you're studying is open". */
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({});
  const [sectionOverrides, setSectionOverrides] = useState<Record<string, boolean>>({});

  const course = useMemo(() => courses.find((x) => x.id === id) ?? null, [courses, id]);
  const checked = useMemo(() => new Set(topicChecks.map((r) => r.id)), [topicChecks]);

  /* Prev/next only changes ?c= — the header's pathname effect won't fire,
     so reset the sheet scroll (and the accordion) here. */
  useEffect(() => {
    document.getElementById("main")?.scrollTo(0, 0);
    setOpenOverrides({});
    setSectionOverrides({});
  }, [id]);

  if (!course) {
    /* The server snapshot has no rows; wait for hydration before calling
       a miss a miss. */
    if (courses.length === 0) return null;
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="text-title">Course not found</div>
        <p className="mt-2 text-body-sm text-muted-foreground">
          This course isn’t on the path — it may have been removed.
        </p>
        <Button asChild size="sm" className="mt-5">
          <Link href="/learning">
            <ArrowLeft data-icon="inline-start" /> Back to Learning
          </Link>
        </Button>
      </div>
    );
  }

  const done = course.status === "completed";
  const active = course.status === "in_progress";
  const start = courseStartISO(profile, course);
  const finish = courseEndISO(profile, course);
  const week = courseWeekOf(profile, course);
  const prog = moduleProgress(course);
  const next = nextModule(course);
  const lp = lessonProgress(course, checked);
  const nl = nextLesson(course, checked);
  /* The module you're actually in — the one holding the next lesson. */
  const currentModuleId = done ? null : (nl?.module.id ?? next?.id ?? null);
  const warm = isWarmup(course);
  const openEnded = course.durationWeeks === null;
  const overdue = !done && finish !== null && daysUntil(finish) < 0;

  /* The weekly rhythm this row owns on the calendar (lib/calendar.ts). */
  const pace = openEnded
    ? { minutes: ONGOING_WEEKLY_MINUTES, copy: "1 h · Sundays" }
    : warm
      ? { minutes: WARMUP_BLOCK_MINUTES, copy: "3 h · one Sunday block" }
      : { minutes: MAIN_DAILY_MINUTES, copy: "90 min · Mon–Fri" };

  const slot =
    course.targetStartMonth !== null
      ? `M${course.targetStartMonth} · ${formatMonth(monthISOForIndex(profile, course.targetStartMonth))}`
      : "Unscheduled";

  const logs = dayEvents
    .filter((e) => e.kind === "study" && e.courseId === course.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const totalMinutes = logs.reduce((s, e) => s + (e.minutes ?? 0), 0);
  const hours = (totalMinutes / 60).toFixed(1).replace(/\.0$/, "");

  const ordered = [...courses].sort(byPathOrder);
  const idx = ordered.findIndex((c) => c.id === course.id);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const nextCourse = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

  function handleLesson(module: CourseModule, lessonId: string) {
    if (!course) return;
    const res = toggleLesson(course, profile, module, lessonId);
    if (res.checked && res.moduleCompleted && !res.courseCompleted) {
      toast.success("Module done", { description: module.title });
    }
  }

  function logToday() {
    if (!course) return;
    stores.dayEvents.create({
      date: todayISO(),
      title: `Study: ${course.title}`,
      kind: "study",
      courseId: course.id,
      minutes: pace.minutes,
      tags: [],
    });
    logActivity("created", `Study time logged: ${course.title} (${pace.minutes}m)`);
    toast.success("Study time logged");
  }

  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={fadeUp}>
        <Button asChild variant="ghost" size="sm" className="-ml-2.5 text-muted-foreground">
          <Link href="/learning">
            <ArrowLeft data-icon="inline-start" /> Learning path
          </Link>
        </Button>
      </motion.div>

      <motion.section variants={fadeUp} aria-label="Course overview">
        <div className="rounded-xl bg-foreground p-6 text-background sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <span className="text-label text-white/50 uppercase">
              {course.phase || "Course"} · {slot}
            </span>
            {course.url && (
              <a
                href={course.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${course.title} on the provider site`}
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white outline-none transition-colors duration-200 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <ArrowUpRight className="size-4" />
              </a>
            )}
          </div>

          <h1 className="mt-2 max-w-2xl text-display leading-tight text-white">{course.title}</h1>
          <div className="mt-1.5 text-body-sm text-white/60">
            {course.provider}
            {course.duration && ` · ${course.duration}`}
            {active && week && course.durationWeeks && ` · wk ${week} of ${course.durationWeeks}`}
            {done && course.completedDate && ` · completed ${formatDay(course.completedDate)}`}
          </div>

          {(lp.total > 0 || prog.total > 0) && (
            <div className="mt-6 flex max-w-md items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-green transition-[width] duration-500"
                  style={{
                    width: `${Math.round(
                      (lp.total > 0 ? lp.done / lp.total : prog.done / prog.total) * 100
                    )}%`,
                  }}
                />
              </div>
              <span className="text-meta text-white/60 tabular-nums">
                {lp.total > 0
                  ? `${lp.done}/${lp.total} lessons · ${prog.done}/${prog.total} modules`
                  : `${prog.done}/${prog.total} modules`}
              </span>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            {active && (
              <Button variant="accent" size="sm" onClick={() => completeCourse(course, profile)}>
                <Check data-icon="inline-start" /> Mark completed
              </Button>
            )}
            {!active && !done && (
              <Button variant="accent" size="sm" onClick={() => startCourse(course, profile)}>
                <Play data-icon="inline-start" /> Start course
              </Button>
            )}
            {done && course.credentialUrl && (
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/10 text-white hover:bg-white/20 hover:text-white"
                asChild
              >
                <a href={course.credentialUrl} target="_blank" rel="noreferrer">
                  <Award data-icon="inline-start" /> View certificate
                </a>
              </Button>
            )}
            {done && (
              <Button
                size="sm"
                variant="ghost"
                className="text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => reopenCourse(course)}
              >
                Reopen
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => setEditOpen(true)}
            >
              <Pencil data-icon="inline-start" /> Edit
            </Button>
            {finish &&
              !done &&
              (overdue ? (
                <Chip tone="risk">past target · {formatDay(finish)}</Chip>
              ) : (
                <span className="text-meta text-white/50 tabular-nums">
                  target finish {formatDay(finish)}
                </span>
              ))}
          </div>
        </div>
      </motion.section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-section">Syllabus</h2>
                {(lp.total > 0 || prog.total > 0) && (
                  <span className="text-meta text-muted-foreground tabular-nums">
                    {lp.total > 0 ? `${lp.done}/${lp.total} lessons` : `${prog.done}/${prog.total} done`}
                  </span>
                )}
              </div>

              {prog.total === 0 ? (
                <p className="mt-3 text-body-sm text-muted-foreground">
                  No modules yet. Open Edit and add the checklist — one module per line.
                </p>
              ) : (
                <ol className="mt-5">
                  {course.modules.map((m, i) => {
                    const isNext = !done && m.id === currentModuleId;
                    const last = i === course.modules.length - 1;
                    const lessons = lessonsFor(m);
                    const doneInModule = lessons.filter((l) => lessonDone(m, checked, l.id)).length;
                    const isOpen = lessons.length > 0 && (openOverrides[m.id] ?? isNext);
                    return (
                      <li key={m.id} className="flex gap-3.5">
                        <div className="flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => toggleCourseModule(course, profile, m.id)}
                            aria-pressed={m.done}
                            aria-label={m.done ? `Uncheck ${m.title}` : `Mark ${m.title} finished`}
                            title={m.done ? "Done — click to uncheck" : "Click when finished"}
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center rounded-full outline-none transition-colors duration-200",
                              "focus-visible:ring-2 focus-visible:ring-ring/60",
                              m.done
                                ? "bg-green text-foreground"
                                : isNext
                                  ? "border-[1.5px] border-foreground bg-background hover:bg-green-soft"
                                  : "border-[1.5px] border-foreground/25 bg-background hover:border-foreground"
                            )}
                          >
                            {m.done && <Check className="size-3.5" strokeWidth={2.5} />}
                          </button>
                          {!last && (
                            <span
                              aria-hidden
                              className={cn("my-1 w-px flex-1", m.done ? "bg-green" : "bg-border")}
                            />
                          )}
                        </div>
                        <div className={cn("min-w-0 flex-1", !last && "pb-5")}>
                          {isNext && <div className="text-label text-green-ink uppercase">Up next</div>}
                          <button
                            type="button"
                            onClick={() =>
                              setOpenOverrides((o) => ({ ...o, [m.id]: !(o[m.id] ?? isNext) }))
                            }
                            aria-expanded={isOpen}
                            disabled={lessons.length === 0}
                            className={cn(
                              "-mx-1.5 flex w-full items-baseline justify-between gap-3 rounded-md px-1.5 py-0.5 text-left outline-none",
                              "transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring/60",
                              lessons.length > 0 && "hover:bg-background/60"
                            )}
                          >
                            <span
                              className={cn(
                                "min-w-0 text-sm leading-snug font-medium",
                                m.done && "text-muted-foreground"
                              )}
                            >
                              {m.title}
                            </span>
                            {lessons.length > 0 && (
                              <span className="flex shrink-0 items-center gap-1 text-meta text-muted-foreground tabular-nums">
                                {doneInModule}/{lessons.length}
                                <ChevronDown
                                  className={cn(
                                    "size-3.5 transition-transform duration-200",
                                    isOpen && "rotate-180"
                                  )}
                                />
                              </span>
                            )}
                          </button>
                          {m.done && m.completedDate && (
                            <div className="mt-0.5 text-meta text-muted-foreground tabular-nums">
                              done {formatDay(m.completedDate)}
                            </div>
                          )}
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="overflow-hidden"
                              >
                                <div className="mt-1 pb-1">
                                  {sectionedLessonsFor(m).map((grp, gi) => {
                                    const grpKey = `${m.id}:${gi}`;
                                    const grpDone = grp.lessons.filter((l) =>
                                      lessonDone(m, checked, l.id)
                                    ).length;
                                    const grpHasNext = grp.lessons.some((l) => l.id === nl?.id);
                                    const grpOpen = grp.section
                                      ? (sectionOverrides[grpKey] ?? grpHasNext)
                                      : true;
                                    const items = (
                                      <ul className="mt-0.5">
                                        {grp.lessons.map((l) => {
                                          const ldone = lessonDone(m, checked, l.id);
                                          const meta = lessonMeta(l);
                                          return (
                                            <li key={l.id}>
                                              <button
                                                type="button"
                                                onClick={() => handleLesson(m, l.id)}
                                                aria-pressed={ldone}
                                                title={l.title}
                                                className={cn(
                                                  "group -mx-1.5 flex w-full items-center gap-2.5 rounded-md px-1.5 py-1 text-left outline-none",
                                                  "transition-colors duration-200 hover:bg-background/70 focus-visible:ring-2 focus-visible:ring-ring/60"
                                                )}
                                              >
                                                <span
                                                  className={cn(
                                                    "flex size-4 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                                                    ldone
                                                      ? "bg-green text-foreground"
                                                      : "border-[1.5px] border-foreground/25 bg-background group-hover:border-foreground"
                                                  )}
                                                >
                                                  {ldone && <Check className="size-2.5" strokeWidth={3} />}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                  <span
                                                    className={cn(
                                                      "block truncate text-[13px] leading-snug",
                                                      ldone ? "text-muted-foreground" : "text-foreground"
                                                    )}
                                                  >
                                                    {l.title}
                                                  </span>
                                                  {meta && (
                                                    <span className="block text-meta leading-tight text-muted-foreground/70">
                                                      {meta}
                                                    </span>
                                                  )}
                                                </span>
                                              </button>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    );
                                    if (!grp.section) return <div key={grpKey}>{items}</div>;
                                    return (
                                      <div key={grpKey}>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSectionOverrides((o) => ({
                                              ...o,
                                              [grpKey]: !(o[grpKey] ?? grpHasNext),
                                            }))
                                          }
                                          aria-expanded={grpOpen}
                                          className={cn(
                                            "-mx-1.5 mt-2.5 flex w-full items-center justify-between gap-3 rounded-md px-1.5 py-1 text-left outline-none",
                                            "transition-colors duration-200 hover:bg-background/60 focus-visible:ring-2 focus-visible:ring-ring/60"
                                          )}
                                        >
                                          <span
                                            className={cn(
                                              "min-w-0 truncate text-label uppercase",
                                              m.done
                                                ? "text-muted-foreground/50"
                                                : "text-muted-foreground/80"
                                            )}
                                          >
                                            {grp.section}
                                          </span>
                                          <span className="flex shrink-0 items-center gap-1 text-meta text-muted-foreground tabular-nums">
                                            {grpDone}/{grp.lessons.length}
                                            <ChevronDown
                                              className={cn(
                                                "size-3 transition-transform duration-200",
                                                grpOpen && "rotate-180"
                                              )}
                                            />
                                          </span>
                                        </button>
                                        <AnimatePresence initial={false}>
                                          {grpOpen && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.2, ease: "easeOut" }}
                                              className="overflow-hidden"
                                            >
                                              {items}
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          <motion.div variants={fadeUp}>
            <Card>
              <CardContent>
                <h2 className="text-section">Schedule</h2>
                <dl className="mt-3 divide-y divide-border/70">
                  <FactRow label="Starts" value={start ? formatDate(start) : "Unscheduled"} />
                  <FactRow
                    label="Target finish"
                    value={finish ? formatDate(finish) : openEnded ? "Open-ended" : "—"}
                    tone={overdue ? "risk" : undefined}
                  />
                  <FactRow
                    label="Time left"
                    value={
                      done
                        ? "Done"
                        : finish
                          ? daysUntil(finish) < 0
                            ? `${Math.abs(daysUntil(finish))}d past target`
                            : `${daysUntil(finish)} days`
                          : "Ongoing"
                    }
                    tone={overdue ? "risk" : undefined}
                  />
                  <FactRow label="Pace" value={pace.copy} />
                  <FactRow
                    label="Track"
                    value={warm ? "Warm-up · parallel" : openEnded ? "Main path · Sundays" : "Main path"}
                  />
                </dl>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card>
              <CardContent>
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-section">Study log</h2>
                  {totalMinutes > 0 && (
                    <span className="text-meta text-muted-foreground tabular-nums">
                      {hours} h · {logs.length} session{logs.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                {logs.length === 0 ? (
                  <p className="mt-3 text-body-sm text-muted-foreground">
                    Nothing logged for this course yet.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-border/70">
                    {logs.slice(0, 5).map((e) => (
                      <li key={e.id} className="flex items-baseline justify-between gap-3 py-2 first:pt-0">
                        <span className="text-body-sm">{formatDate(e.date)}</span>
                        <span className="text-meta text-muted-foreground tabular-nums">
                          {e.minutes ?? 0} min
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {!done && (
                  <Button size="sm" className="mt-4" onClick={logToday}>
                    <Plus data-icon="inline-start" /> Log {pace.minutes} min today
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {(prev || nextCourse) && (
        <motion.div variants={fadeUp} className="flex items-center justify-between gap-3">
          {prev ? (
            <Button asChild variant="outline" size="sm" className="max-w-[46%]">
              <Link href={`/learning/course?c=${prev.id}`}>
                <ArrowLeft data-icon="inline-start" />
                <span className="truncate">{prev.title}</span>
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {nextCourse && (
            <Button asChild variant="outline" size="sm" className="ml-auto max-w-[46%]">
              <Link href={`/learning/course?c=${nextCourse.id}`}>
                <span className="truncate">{nextCourse.title}</span>
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          )}
        </motion.div>
      )}

      <CourseDialog open={editOpen} course={course} profile={profile} onOpenChange={setEditOpen} />
    </motion.div>
  );
}
