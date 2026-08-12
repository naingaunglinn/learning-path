"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, CircleCheck, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { rowInOut } from "@/lib/motion";
import type { Course, Profile } from "@/lib/schemas";
import { courseStatuses } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import {
  aidApplyByDate,
  aidCompletionDeadline,
  deadlineTone,
  describeDaysUntil,
  withCourseDerivations,
} from "@/lib/aid";
import { daysUntil, formatDate, formatDay, todayISO } from "@/lib/dates";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_LABEL: Record<(typeof courseStatuses)[number], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

function WeightChip({ weight }: { weight: Course["hiringWeight"] }) {
  return (
    <span
      title="Hiring weight"
      className={cn(
        "inline-flex h-5 items-center rounded-md px-1.5 text-[10px] font-medium tracking-[0.06em] uppercase",
        weight === "high" && "bg-primary text-primary-foreground",
        weight === "medium" && "border text-foreground",
        weight === "checkbox" && "border border-dashed text-muted-foreground"
      )}
    >
      {weight}
    </span>
  );
}

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

  const applyBy = aidApplyByDate(profile, course);
  const deadline = aidCompletionDeadline(course);

  function persist(patch: Partial<Course>) {
    stores.courses.update(course.id, withCourseDerivations({ ...course, ...patch }));
  }

  function setStatus(status: Course["status"]) {
    persist({ status });
    if (status === "completed") {
      logActivity("completed", `Course completed: ${course.title}`);
      toast.success("Course completed", {
        description: "Now listed under Portfolio → Learning completions.",
      });
    } else {
      logActivity("updated", `Course ${STATUS_LABEL[status].toLowerCase()}: ${course.title}`);
    }
  }

  function markAidApplied() {
    persist({ financialAidStatus: "applied", aidAppliedDate: todayISO() });
    logActivity("updated", `Financial aid filed: ${course.title}`);
    toast.success("Aid application filed", { description: "Review usually takes ~15 days." });
  }

  function markAidApproved() {
    const approved = todayISO();
    persist({ financialAidStatus: "approved", aidApprovedDate: approved });
    const d = aidCompletionDeadline({ aidApplicable: true, aidApprovedDate: approved });
    logActivity("updated", `Financial aid approved: ${course.title}`);
    toast.success("Aid approved — 180-day window open", {
      description: d ? `Complete by ${formatDate(d)}.` : undefined,
    });
  }

  function markAidDenied() {
    persist({ financialAidStatus: "denied" });
    logActivity("updated", `Financial aid denied: ${course.title}`);
    toast("Aid denied", { description: "You can reapply — Coursera allows a new application after edits." });
  }

  function removeCourse() {
    stores.courses.remove(course.id);
    logActivity("removed", `Course removed: ${course.title}`);
    toast("Course removed");
  }

  const done = course.status === "completed";

  return (
    <motion.div layout variants={rowInOut} initial="hidden" animate="show" exit="exit">
      <Card size="sm">
        <CardContent className="space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {done && <CircleCheck className="size-4 shrink-0 text-gold-ink" aria-hidden />}
                <span className="truncate text-sm font-medium">{course.title}</span>
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
            <div className="flex shrink-0 items-center gap-1.5">
              <WeightChip weight={course.hiringWeight} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${course.title}`}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={onEdit}>
                    <Pencil /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Select value={course.status} onValueChange={(v) => setStatus(v as Course["status"])}>
              <SelectTrigger size="sm" className="h-6 w-[122px] text-xs" aria-label="Course status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courseStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {done && course.completedDate && (
              <Chip tone="gold">done {formatDay(course.completedDate)}</Chip>
            )}

            {course.aidApplicable && !done && (
              <>
                {course.financialAidStatus === "not_applied" && applyBy && (
                  <>
                    <Chip
                      tone={deadlineTone(applyBy)}
                      title="Start month minus ~3 weeks (15-day review + buffer)"
                    >
                      aid: apply by {formatDay(applyBy)} · {describeDaysUntil(applyBy)}
                    </Chip>
                    <Button variant="ghost" size="xs" onClick={markAidApplied}>
                      Mark applied
                    </Button>
                  </>
                )}
                {course.financialAidStatus === "applied" && (
                  <>
                    <Chip tone="muted" title="Coursera review takes ~15 days">
                      aid in review{course.aidAppliedDate && ` · filed ${formatDay(course.aidAppliedDate)}`}
                    </Chip>
                    <Button variant="ghost" size="xs" onClick={markAidApproved}>
                      Mark approved
                    </Button>
                    <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={markAidDenied}>
                      Denied?
                    </Button>
                  </>
                )}
                {course.financialAidStatus === "approved" && deadline && (
                  <>
                    <Chip tone="gold">aid approved</Chip>
                    <Chip
                      tone={deadlineTone(deadline)}
                      title="180-day completion window from aid approval"
                    >
                      {daysUntil(deadline) < 0
                        ? `window closed ${formatDay(deadline)}`
                        : `${daysUntil(deadline)}d left · complete by ${formatDate(deadline)}`}
                    </Chip>
                  </>
                )}
                {course.financialAidStatus === "denied" && (
                  <>
                    <Chip tone="risk">aid denied</Chip>
                    <Button variant="ghost" size="xs" onClick={markAidApplied}>
                      Reapply
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDelete
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        what={course.title}
        detail="This removes the course and its aid history from the roadmap. There is no undo."
        onConfirm={removeCourse}
      />
    </motion.div>
  );
}
