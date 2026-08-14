"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { EASE_OUT, fadeUp, staggerParent } from "@/lib/motion";
import { useCollection, useProfile } from "@/lib/use-collection";
import { formatDate, todayISO, weeksUntil } from "@/lib/dates";
import { courseEndISO, courseWeekOf } from "@/lib/aid";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/anim/animated-number";

/* SVG strokes take literal hex, same as milestone-chart. */
const GREEN = "#34d65c";
const RISK = "#841818";
const TRACK = "#dededb";

function useValueFlash(value: number) {
  const [flash, setFlash] = useState(0);
  const prev = useRef<number | null>(null);
  useEffect(() => {
    if (prev.current !== null && prev.current !== value) setFlash((f) => f + 1);
    prev.current = value;
  }, [value]);
  return flash;
}

/* ---------------------------------------------------------------- */
/* Donut: arc = fraction of the ring, sweeping in on mount. The      */
/* center is free-form — the hero holds its countdown, the stat      */
/* cards their percentage.                                           */
/* ---------------------------------------------------------------- */

function Donut({
  fraction,
  size,
  stroke,
  color,
  track = TRACK,
  delay = 0,
  children,
}: {
  fraction: number;
  size: number;
  stroke: number;
  color: string;
  track?: string;
  delay?: number;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, fraction));

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - p) }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Pace: where should this count be, `elapsed` of the way through    */
/* the runway? Behind is the only red — everything else stays calm.  */
/* ---------------------------------------------------------------- */

type Pace = { label: string; tone: "green" | "risk" | "muted" };

function paceOf(done: number, total: number, expected: number): Pace {
  if (total === 0) return { label: "nothing planned", tone: "muted" };
  const delta = done - Math.min(total, Math.max(0, expected));
  if (delta < 0) return { label: `${-delta} behind pace`, tone: "risk" };
  if (delta === 0) return { label: "on pace", tone: "green" };
  return { label: `${delta} ahead of pace`, tone: "green" };
}

/* The hero owns the app's single dark fill: the runway ring. */
function HeroCard({
  weeksLeft,
  totalWeeks,
  elapsed,
}: {
  weeksLeft: number;
  totalWeeks: number;
  elapsed: number;
}) {
  const profile = useProfile();
  const flash = useValueFlash(weeksLeft);
  const weekOf = Math.max(1, Math.min(totalWeeks, totalWeeks - weeksLeft + 1));

  return (
    <motion.div variants={fadeUp} className="sm:col-span-2 xl:col-span-2">
      <div className="relative flex h-full items-center justify-between gap-5 overflow-hidden rounded-xl bg-foreground p-5 text-white">
        {flash > 0 && (
          <motion.span
            key={flash}
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-white"
            initial={{ opacity: 0.25 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
        <div className="flex min-w-0 flex-col self-stretch">
          <div className="text-label text-white/50 uppercase">Weeks to target</div>
          <div className="mt-2 text-body-sm text-white/70">
            {profile.targetLabel} · {formatDate(profile.targetDate)}
          </div>
          <div className="mt-auto pt-3 text-meta text-white/50 tabular-nums">
            Week {weekOf} of {totalWeeks} · {Math.round(elapsed * 100)}% of runway used
          </div>
        </div>
        <Donut
          fraction={totalWeeks ? weeksLeft / totalWeeks : 0}
          size={112}
          stroke={8}
          color={GREEN}
          track="rgba(255,255,255,0.14)"
          delay={0.05}
        >
          <AnimatedNumber
            value={weeksLeft}
            className="text-[26px] leading-none font-bold tracking-[-0.02em]"
          />
          <span className="mt-1 text-[10px] font-medium tracking-[0.08em] text-white/50 uppercase">
            wks left
          </span>
        </Donut>
      </div>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  of,
  pace,
  context,
  delay = 0,
  className,
}: {
  label: string;
  value: number;
  of: number;
  pace: Pace;
  context: string;
  delay?: number;
  className?: string;
}) {
  const flash = useValueFlash(value);
  const zero = value === 0;
  const fraction = of > 0 ? value / of : 0;
  const behind = pace.tone === "risk";

  return (
    <motion.div variants={fadeUp} className={className}>
      <Card size="sm" className="relative h-full">
        {flash > 0 && (
          <motion.span
            key={flash}
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-green-soft"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
        <CardContent className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-label text-muted-foreground uppercase">{label}</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <AnimatedNumber
                  value={value}
                  className={cn("text-display", zero && "text-subtle", !zero && behind && "text-risk")}
                />
                <span className="text-meta font-medium text-muted-foreground">/ {of}</span>
              </div>
            </div>
            <Donut fraction={fraction} size={56} stroke={6} color={behind ? RISK : GREEN} delay={delay}>
              <span
                className={cn(
                  "text-[11px] font-semibold tabular-nums",
                  zero ? "text-subtle" : behind ? "text-risk" : "text-green-ink"
                )}
              >
                {Math.round(fraction * 100)}%
              </span>
            </Donut>
          </div>
          <div className="mt-auto pt-3">
            {/* Stacked, not side-by-side: side-by-side truncated the context
                into fragments ("1 in c…") at xl card widths. */}
            <div className="space-y-1 border-t border-border/70 pt-2.5">
              <div
                className={cn(
                  "flex items-center gap-1.5 text-meta font-medium",
                  pace.tone === "risk" && "text-risk",
                  pace.tone === "green" && "text-green-ink",
                  pace.tone === "muted" && "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    pace.tone === "risk" ? "bg-risk" : pace.tone === "green" ? "bg-green" : "bg-subtle"
                  )}
                  aria-hidden
                />
                {pace.label}
              </div>
              <div className="truncate text-meta text-muted-foreground" title={context}>
                {context}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function KpiCards() {
  const profile = useProfile();
  const gapProjects = useCollection("gapProjects");
  const networking = useCollection("networking");
  const certifications = useCollection("certifications");
  const courses = useCollection("courses");

  const weeksLeft = Math.max(0, weeksUntil(profile.targetDate));
  const totalWeeks = Math.max(
    1,
    Math.ceil((Date.parse(profile.targetDate) - Date.parse(profile.timelineStart + "-01")) / (7 * 86_400_000))
  );
  const elapsed = Math.min(1, Math.max(0, 1 - weeksLeft / totalWeeks));

  /* Projects: the plan is the gap-project list; Portfolio keeps the
     pre-plan systems as evidence. */
  const shipped = gapProjects.filter((g) => g.status === "shipped").length;
  const building = gapProjects.filter((g) => g.status === "in_progress").length;
  const nextProject =
    gapProjects.find((g) => g.starred && g.status !== "shipped") ??
    gapProjects.find((g) => g.status === "in_progress") ??
    gapProjects.find((g) => g.status === "not_started");
  const projectContext = nextProject
    ? `${building > 0 && nextProject.status === "in_progress" ? "building" : "next"}: ${nextProject.title}`
    : "plan projects in Tracker";

  const sent = networking.filter((n) => n.status !== "not_contacted").length;
  const convos = networking.filter((n) => n.status === "in_conversation" || n.status === "offer").length;
  const appContext = convos > 0 ? `${convos} in conversation` : "no conversations yet";

  const certsDone = certifications.length + courses.filter((c) => c.status === "completed").length;
  const certsTotal = certifications.length + courses.length;
  /* Courses carry real roadmap dates, so their pace follows the schedule:
     a course is only "expected" once its planned finish has passed. The
     other two counters have no per-item dates and pace linearly. */
  const today = todayISO();
  const coursesDue = courses.filter((c) => {
    const end = courseEndISO(profile, c);
    return end !== null && end <= today;
  }).length;
  const certsExpected = certifications.length + coursesDue;
  const current = courses.find((c) => c.status === "in_progress");
  const currentWeek = current ? courseWeekOf(profile, current) : null;
  const upcomingMonths = courses
    .filter((c) => c.status !== "completed" && c.targetStartMonth !== null)
    .map((c) => c.targetStartMonth as number);
  const certContext = current
    ? currentWeek && current.durationWeeks
      ? `wk ${currentWeek}/${current.durationWeeks} · ${current.title}`
      : `now: ${current.title}`
    : upcomingMonths.length
      ? `first lands ~M${Math.min(...upcomingMonths)}`
      : "queue a course";

  return (
    <motion.div
      variants={staggerParent}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
    >
      <HeroCard weeksLeft={weeksLeft} totalWeeks={totalWeeks} elapsed={elapsed} />
      <StatCard
        label="Projects shipped"
        value={shipped}
        of={gapProjects.length}
        pace={paceOf(shipped, gapProjects.length, Math.floor(gapProjects.length * elapsed))}
        context={projectContext}
        delay={0.1}
      />
      <StatCard
        label="Applications sent"
        value={sent}
        of={networking.length}
        pace={paceOf(sent, networking.length, Math.floor(networking.length * elapsed))}
        context={appContext}
        delay={0.16}
      />
      <StatCard
        label="Certs completed"
        value={certsDone}
        of={certsTotal}
        pace={paceOf(certsDone, certsTotal, certsExpected)}
        context={certContext}
        delay={0.22}
        className="sm:col-span-2 xl:col-span-1"
      />
    </motion.div>
  );
}
