"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerParent } from "@/lib/motion";
import type { Course, Profile } from "@/lib/schemas";
import { currentMonthIndex, monthISOForIndex } from "@/lib/aid";
import { formatMonth } from "@/lib/dates";
import { CourseCard } from "./course-card";

type PhaseGroup = { name: string; courses: Course[]; from: number; to: number };

/** The Warm-up track runs alongside the numbered phases, not between them. */
const isParallelPhase = (name: string) => name.toLowerCase().startsWith("warm-up");

/** The path grouped into its phases, in the order they begin. Unscheduled
    courses are handled by the caller — nothing is silently dropped here. */
export function RoadmapView({
  profile,
  courses,
  onEdit,
}: {
  profile: Profile;
  courses: Course[];
  onEdit: (course: Course) => void;
}) {
  const nowIdx = currentMonthIndex(profile);
  const scheduled = courses.filter((c) => c.targetStartMonth !== null);

  const byPhase = new Map<string, Course[]>();
  for (const c of scheduled) {
    const key = c.phase || "More";
    byPhase.set(key, [...(byPhase.get(key) ?? []), c]);
  }

  const groups: PhaseGroup[] = [...byPhase.entries()]
    .map(([name, list]) => {
      const months = list.map((c) => c.targetStartMonth as number);
      return {
        name,
        courses: list.sort(
          (a, b) => (a.targetStartMonth as number) - (b.targetStartMonth as number) || a.title.localeCompare(b.title)
        ),
        from: Math.min(...months),
        to: Math.max(...months),
      };
    })
    .sort(
      (a, b) =>
        a.from - b.from || Number(isParallelPhase(b.name)) - Number(isParallelPhase(a.name))
    );

  if (groups.length === 0) return null;

  let phaseNo = 0;

  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="space-y-7">
      {groups.map((group) => {
        const done = group.courses.filter((c) => c.status === "completed").length;
        const parallel = isParallelPhase(group.name);
        if (!parallel) phaseNo += 1;
        return (
          <motion.section key={group.name} variants={fadeUp} aria-label={`Phase: ${group.name}`}>
            <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-label text-subtle uppercase tabular-nums">
                {parallel ? "Parallel track · ~3 h/wk" : `Phase ${phaseNo}`}
              </span>
              <h3 className="text-section">{group.name}</h3>
              <span className="text-meta text-muted-foreground tabular-nums">
                {formatMonth(monthISOForIndex(profile, group.from))}
                {group.to !== group.from && ` – ${formatMonth(monthISOForIndex(profile, group.to))}`}
              </span>
              <span className="ml-auto flex items-center gap-2 text-meta text-muted-foreground tabular-nums">
                {done}/{group.courses.length} completed
                <span className="h-1 w-16 overflow-hidden rounded-full bg-black/[0.07]">
                  <span
                    className="block h-full rounded-full bg-green"
                    style={{ width: `${Math.round((done / group.courses.length) * 100)}%` }}
                  />
                </span>
              </span>
            </div>

            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {group.courses.map((course) => {
                  const idx = course.targetStartMonth as number;
                  const isNow = idx === nowIdx;
                  return (
                    <div
                      key={course.id}
                      className="grid grid-cols-[64px_1fr] items-center gap-x-3 sm:grid-cols-[76px_1fr]"
                    >
                      <div className="text-right">
                        <div
                          className={cn(
                            "text-body-sm font-semibold tabular-nums",
                            isNow ? "text-green-ink" : "text-foreground"
                          )}
                        >
                          M{idx}
                        </div>
                        <div className="text-[11px] text-muted-foreground tabular-nums">
                          {formatMonth(monthISOForIndex(profile, idx))}
                        </div>
                      </div>
                      <CourseCard course={course} profile={profile} onEdit={() => onEdit(course)} />
                    </div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.section>
        );
      })}
    </motion.div>
  );
}
