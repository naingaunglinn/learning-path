"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { rowInOut } from "@/lib/motion";
import type { Course, Profile } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import {
  courseEndISO,
  courseWeekOf,
  monthISOForIndex,
  withCourseDerivations,
} from "@/lib/aid";
import { moduleProgress } from "@/lib/modules";
import { daysUntil, formatDay, formatMonth } from "@/lib/dates";
import {
  completeCourse,
  rechainQueue,
  reopenCourse,
  toggleCourseModule,
} from "./course-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Chip } from "@/components/shared/chip";
import { ConfirmDelete } from "@/components/shared/confirm-delete";

export function CourseCard({
  course,
  profile,
  onEdit,
}: {
  course: Course;
  profile: Profile;
  onEdit: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const done = course.status === "completed";
  const active = course.status === "in_progress";
  const finish = courseEndISO(profile, course);
  const week = courseWeekOf(profile, course);
  const prog = moduleProgress(course);

  function persist(patch: Partial<Course>) {
    stores.courses.update(course.id, withCourseDerivations({ ...course, ...patch }));
  }

  /* The one interaction that matters: click the circle when a course is done. */
  function toggleDone() {
    if (!done) completeCourse(course, profile);
    else reopenCourse(course);
  }

  function setStatus(status: Course["status"], message: string) {
    persist({ status });
    rechainQueue(profile);
    logActivity("updated", `${message}: ${course.title}`);
    toast.success(message);
  }

  function removeCourse() {
    stores.courses.remove(course.id);
    logActivity("removed", `Course removed: ${course.title}`);
    toast("Course removed");
  }

  return (
    <motion.div layout variants={rowInOut} initial="hidden" animate="show" exit="exit">
      <Card size="sm">
        <CardContent>
          <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleDone}
            aria-pressed={done}
            aria-label={done ? `Reopen ${course.title}` : `Mark ${course.title} completed`}
            title={done ? "Completed — click to reopen" : "Click when finished"}
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full outline-none transition-colors duration-200",
              "focus-visible:ring-2 focus-visible:ring-ring/60",
              done
                ? "bg-green text-foreground"
                : "border-[1.5px] border-foreground/25 bg-background hover:border-foreground"
            )}
          >
            {done && <Check className="size-3.5" strokeWidth={2.5} />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/learning/course?c=${course.id}`}
                className="truncate rounded-sm text-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                {course.title}
              </Link>
              {course.url && (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${course.title}`}
                  className="rounded-sm text-muted-foreground outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <ArrowUpRight className="size-3.5" />
                </a>
              )}
            </div>
            <div className="mt-0.5 truncate text-xs text-muted-foreground">
              {course.provider}
              {course.duration && ` · ${course.duration}`}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            {done && course.completedDate && <Chip tone="win">done {formatDay(course.completedDate)}</Chip>}
            {active && (
              <Chip tone="neutral">
                in progress{week && course.durationWeeks ? ` · wk ${week}/${course.durationWeeks}` : ""}
              </Chip>
            )}
            {active && finish && (
              <Chip
                tone={daysUntil(finish) < 0 ? "risk" : "ghost"}
                title="Target finish at ~10 h/week"
              >
                {daysUntil(finish) < 0 ? `past target · ${formatDay(finish)}` : `finish by ${formatDay(finish)}`}
              </Chip>
            )}
            {!done && !active && (
              <Chip tone="ghost">
                {course.targetStartMonth !== null
                  ? `starts ${formatMonth(monthISOForIndex(profile, course.targetStartMonth))}`
                  : "unscheduled"}
              </Chip>
            )}
            {course.aidApplicable && course.financialAidStatus !== "not_applied" && (
              <Chip tone="ghost" title="Legacy financial-aid tracking">
                aid {course.financialAidStatus}
              </Chip>
            )}
          </div>

          {prog.total > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              aria-label={`${prog.done} of ${prog.total} modules done — toggle the checklist`}
              title={expanded ? "Hide the module checklist" : "Show the module checklist"}
              className={cn(
                "flex h-6 shrink-0 items-center gap-1 rounded-full px-2 outline-none transition-colors duration-200",
                "text-meta text-muted-foreground tabular-nums",
                "hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
              )}
            >
              {prog.done}/{prog.total}
              <ChevronDown
                className={cn("size-3.5 transition-transform duration-200", expanded && "rotate-180")}
              />
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${course.title}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/learning/course?c=${course.id}`}>
                  <BookOpen /> Course page
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil /> Edit
              </DropdownMenuItem>
              {!active && !done && (
                <DropdownMenuItem onSelect={() => setStatus("in_progress", "Course started")}>
                  <Play /> Start now
                </DropdownMenuItem>
              )}
              {active && (
                <DropdownMenuItem onSelect={() => setStatus("not_started", "Course moved back to queue")}>
                  <RotateCcw /> Back to queue
                </DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>

          <AnimatePresence initial={false}>
            {expanded && prog.total > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <ul className="mt-3 space-y-0.5 border-t pt-2.5 pl-9">
                  {course.modules.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => toggleCourseModule(course, profile, m.id)}
                        aria-pressed={m.done}
                        title={m.title}
                        className={cn(
                          "group flex w-full items-center gap-2.5 rounded-md px-1.5 py-1 text-left outline-none",
                          "transition-colors duration-200 hover:bg-background/70 focus-visible:ring-2 focus-visible:ring-ring/60"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                            m.done
                              ? "bg-green text-foreground"
                              : "border-[1.5px] border-foreground/25 bg-background group-hover:border-foreground"
                          )}
                        >
                          {m.done && <Check className="size-2.5" strokeWidth={3} />}
                        </span>
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-xs",
                            m.done ? "text-muted-foreground" : "text-foreground"
                          )}
                        >
                          {m.title}
                        </span>
                        {m.done && m.completedDate && (
                          <span className="shrink-0 text-meta text-muted-foreground tabular-nums">
                            {formatDay(m.completedDate)}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <ConfirmDelete
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        what={course.title}
        detail="This removes the course from the path. There is no undo."
        onConfirm={removeCourse}
      />
    </motion.div>
  );
}
