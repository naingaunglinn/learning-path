"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  CircleDollarSign,
  Flag,
  GraduationCap,
  StickyNote,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { EASE_OUT } from "@/lib/motion";
import type { CalEvent, CalEventType } from "@/lib/calendar";
import { dayTitle } from "@/lib/calendar";
import type { Course } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Chip } from "@/components/shared/chip";
import { IconChip } from "@/components/shared/icon-chip";

const TYPE_ICON: Record<CalEventType, LucideIcon> = {
  course_start: GraduationCap,
  course_finish: Flag,
  plan_study: CalendarClock,
  aid_apply: CircleDollarSign,
  aid_deadline: CircleDollarSign,
  milestone: Flag,
  critical: TriangleAlert,
  study: BookOpen,
  note: StickyNote,
};

const TYPE_LABEL: Record<CalEventType, string> = {
  course_start: "course",
  course_finish: "target finish",
  plan_study: "planned",
  aid_apply: "aid",
  aid_deadline: "aid window",
  milestone: "milestone",
  critical: "critical path",
  study: "study",
  note: "note",
};

export function DayPanel({
  date,
  events,
  courses,
  onClose,
  onEditCourse,
}: {
  date: string;
  events: CalEvent[];
  courses: Course[];
  onClose: () => void;
  onEditCourse: (course: Course) => void;
}) {
  const [minutes, setMinutes] = useState("30");
  const [studyCourseId, setStudyCourseId] = useState<string>("none");
  const [note, setNote] = useState("");

  function logStudy() {
    const mins = Math.max(0, Number(minutes) || 0);
    const course = studyCourseId === "none" ? null : courses.find((c) => c.id === studyCourseId);
    stores.dayEvents.create({
      date,
      title: course ? `Study: ${course.title}` : "Study block",
      kind: "study",
      courseId: course?.id ?? null,
      minutes: mins || null,
      tags: [],
    });
    logActivity("created", `Study time logged${course ? `: ${course.title}` : ""} (${mins}m)`);
    toast.success("Study time logged");
  }

  function addNote(e: React.FormEvent) {
    e.preventDefault();
    const title = note.trim();
    if (!title) return;
    stores.dayEvents.create({ date, title, kind: "note", courseId: null, minutes: null, tags: [] });
    setNote("");
    toast.success("Note added");
  }

  function removeDayEvent(ev: CalEvent) {
    stores.dayEvents.remove(ev.refId);
    toast("Removed");
  }

  /* One click turns a planned session into logged study time — the derived
     plan entry for this day disappears in its favor. */
  function logPlanned(ev: CalEvent) {
    const course = ev.courseId ? courses.find((c) => c.id === ev.courseId) : null;
    stores.dayEvents.create({
      date,
      title: course ? `Study: ${course.title}` : "Study block",
      kind: "study",
      courseId: ev.courseId,
      minutes: ev.minutes ?? null,
      tags: [],
    });
    logActivity("created", `Study time logged: ${course?.title ?? "study block"} (${ev.minutes ?? 0}m)`);
    toast.success("Logged as studied");
  }

  return (
    <motion.div
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="min-w-0"
    >
      <Card className="h-full">
        <CardHeader className="border-b">
          <CardTitle className="text-section">{dayTitle(date)}</CardTitle>
          <CardAction>
            <Button variant="ghost" size="icon-xs" aria-label="Close day panel" onClick={onClose}>
              <X />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {events.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">
              Nothing on this day. Log study time below, or leave a note.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {events.map((ev) => {
                const Icon = TYPE_ICON[ev.type];
                const course = ev.courseId ? courses.find((c) => c.id === ev.courseId) : null;
                const tone = ev.tone === "risk" ? "risk" : ev.tone === "win" ? "win" : "neutral";
                return (
                  <li key={ev.id} className="flex items-start gap-2.5">
                    <IconChip tone={tone}>
                      <Icon />
                    </IconChip>
                    <div className="min-w-0 flex-1">
                      <div className="text-body-sm leading-snug font-medium">{ev.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Chip tone="ghost" className="uppercase">
                          {TYPE_LABEL[ev.type]}
                        </Chip>
                        {ev.session && (
                          <Chip
                            tone={ev.session.type === "apply" || ev.session.type === "ship" ? "win" : "ghost"}
                            className="uppercase"
                          >
                            {ev.session.type}
                          </Chip>
                        )}
                        {ev.session?.source === "derived" && <Chip tone="ghost">derived</Chip>}
                        {typeof ev.minutes === "number" && ev.minutes > 0 && (
                          <Chip tone="neutral">{ev.minutes}m</Chip>
                        )}
                        {ev.type === "plan_study" && (
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-green-ink"
                            onClick={() => logPlanned(ev)}
                          >
                            Log this
                          </Button>
                        )}
                        {ev.refKind === "course" && course && ev.type !== "plan_study" && (
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-muted-foreground"
                            onClick={() => onEditCourse(course)}
                          >
                            Edit course
                          </Button>
                        )}
                        {(ev.refKind === "milestone" || ev.refKind === "critical" || ev.refKind === "gapProject") && (
                          <Button asChild variant="ghost" size="xs" className="text-muted-foreground">
                            <Link href="/tracker">
                              Open tracker <ArrowUpRight data-icon="inline-end" />
                            </Link>
                          </Button>
                        )}
                        {ev.refKind === "dayEvent" && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Remove “${ev.title}”`}
                            onClick={() => removeDayEvent(ev)}
                          >
                            <X />
                          </Button>
                        )}
                      </div>
                      {/* The generated session's exact unit of work: items,
                          minutes, and what exists at the end. */}
                      {ev.session && (ev.session.items.length > 0 || ev.session.output) && (
                        <div className="mt-1.5 space-y-1">
                          {ev.session.items.length > 0 && (
                            <ul className="space-y-0.5">
                              {ev.session.items.slice(0, 8).map((it, i) => (
                                <li
                                  key={i}
                                  className="flex items-baseline gap-1.5 text-meta text-muted-foreground"
                                >
                                  <span className="text-subtle" aria-hidden>
                                    ·
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    {it.title}
                                    {it.part ? ` (${it.part})` : ""}
                                  </span>
                                  <span className="shrink-0 tabular-nums">{it.minutes}m</span>
                                </li>
                              ))}
                              {ev.session.items.length > 8 && (
                                <li className="pl-3 text-meta text-subtle">
                                  +{ev.session.items.length - 8} more
                                </li>
                              )}
                            </ul>
                          )}
                          <div className="text-meta text-green-ink">→ {ev.session.output}</div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="grid gap-2 border-t pt-4">
            <div className="text-label text-muted-foreground uppercase">Log study time</div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={5}
                step={5}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                aria-label="Minutes studied"
                className="h-7 w-20 text-chip"
              />
              <span className="text-meta text-muted-foreground">min</span>
              <Select value={studyCourseId} onValueChange={setStudyCourseId}>
                <SelectTrigger size="sm" className="h-7 flex-1 text-chip" aria-label="Course studied">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No course</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={logStudy}>
                Log
              </Button>
            </div>
          </div>

          <form onSubmit={addNote} className="flex items-center gap-2">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for this day…"
              aria-label="New note"
              className="h-7 text-chip"
            />
            <Button type="submit" size="sm" variant="outline" disabled={!note.trim()}>
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
