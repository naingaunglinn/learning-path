"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerParent } from "@/lib/motion";
import type { Course } from "@/lib/schemas";
import { useCollection, useProfile } from "@/lib/use-collection";
import { AID_PENDING_CEILING, currentMonthIndex, monthISOForIndex, pendingAidCount } from "@/lib/aid";
import { formatMonth } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CourseCard } from "./course-card";
import { CourseDialog } from "./course-dialog";

const STATUS_ORDER: Record<Course["status"], number> = {
  in_progress: 0,
  not_started: 1,
  completed: 2,
};

function ToolbarStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "risk";
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={cn("text-sm font-semibold tabular-nums", tone === "risk" && "text-risk")}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function LearningView() {
  const profile = useProfile();
  const courses = useCollection("courses");
  const [dialog, setDialog] = useState<{ open: boolean; course: Course | null }>({
    open: false,
    course: null,
  });

  const pending = pendingAidCount(courses);
  const inProgress = courses.filter((c) => c.status === "in_progress").length;
  const completed = courses.filter((c) => c.status === "completed").length;
  const nowIdx = currentMonthIndex(profile);

  const byMonth = new Map<number, Course[]>();
  for (const c of courses) {
    const list = byMonth.get(c.targetStartMonth) ?? [];
    list.push(c);
    byMonth.set(c.targetStartMonth, list);
  }
  for (const list of byMonth.values()) {
    list.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.title.localeCompare(b.title));
  }

  const months = Array.from({ length: profile.timelineMonths }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <Card size="sm">
        <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <ToolbarStat
            label={`/ ${AID_PENDING_CEILING} aid applications pending`}
            value={String(pending)}
            tone={pending >= AID_PENDING_CEILING ? "risk" : "default"}
          />
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
          <ToolbarStat label="in progress" value={String(inProgress)} />
          <ToolbarStat label={`of ${courses.length} completed`} value={String(completed)} />
          <div className="ml-auto">
            <Button size="sm" onClick={() => setDialog({ open: true, course: null })}>
              <Plus data-icon="inline-start" /> Add course
            </Button>
          </div>
        </CardContent>
      </Card>

      <motion.ol variants={staggerParent} initial="hidden" animate="show" aria-label="Learning roadmap by month">
        {months.map((idx) => {
          const list = byMonth.get(idx) ?? [];
          const isNow = idx === nowIdx;
          const empty = list.length === 0;
          return (
            <motion.li
              key={idx}
              variants={fadeUp}
              className={cn(
                "grid grid-cols-[84px_1fr] gap-x-4 border-b border-border/70 last:border-0 sm:grid-cols-[96px_1fr]",
                empty ? "py-2" : "py-3"
              )}
            >
              <div className="pt-0.5">
                <div className="flex items-center gap-1.5">
                  {isNow && <span className="size-1.5 bg-gold" aria-hidden />}
                  <span
                    className={cn(
                      "text-[13px] font-semibold tabular-nums",
                      empty && !isNow && "font-medium text-muted-foreground/60"
                    )}
                  >
                    M{idx}
                  </span>
                </div>
                <div className={cn("text-[11px] text-muted-foreground", empty && "text-muted-foreground/60")}>
                  {formatMonth(monthISOForIndex(profile, idx))}
                </div>
                {isNow && (
                  <div className="mt-0.5 text-[10px] font-medium tracking-[0.1em] text-gold-ink uppercase">
                    Now
                  </div>
                )}
              </div>
              <div className="min-w-0 space-y-2">
                {empty ? (
                  <div className="flex h-full items-center text-xs text-muted-foreground/40" aria-hidden>
                    —
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {list.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        profile={profile}
                        onEdit={() => setDialog({ open: true, course })}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.li>
          );
        })}
      </motion.ol>

      <CourseDialog
        open={dialog.open}
        course={dialog.course}
        profile={profile}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
    </div>
  );
}
