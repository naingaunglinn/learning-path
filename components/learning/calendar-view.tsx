"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import type { CalEvent, CalTone } from "@/lib/calendar";
import { addMonthsISO, groupByDate, monthGridWeeks, monthTitle } from "@/lib/calendar";
import { currentMonthISO, daysUntil, todayISO } from "@/lib/dates";
import { Button } from "@/components/ui/button";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DOT: Record<CalTone, string> = {
  text: "bg-foreground",
  win: "bg-green",
  risk: "bg-risk",
  waived: "bg-muted-foreground/40",
};

function EventDot({ event, reduce }: { event: CalEvent; reduce: boolean }) {
  const d = daysUntil(event.date);
  const pulse = event.deadline && d >= 0 && d <= 7 && !reduce;
  return (
    <span className="relative flex size-1.5">
      {pulse && (
        <motion.span
          aria-hidden
          className={cn("absolute inset-0 rounded-full", DOT[event.tone])}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span className={cn("relative size-1.5 rounded-full", DOT[event.tone])} />
    </span>
  );
}

export function CalendarView({
  events,
  selected,
  onSelect,
}: {
  events: CalEvent[];
  selected: string | null;
  onSelect: (date: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const reduce = useReducedMotion() ?? false;
  const [viewMonth, setViewMonth] = useState<string>(() => {
    const d = searchParams.get("d");
    return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d.slice(0, 7) : currentMonthISO();
  });
  const [dir, setDir] = useState(1);

  const byDate = useMemo(() => groupByDate(events), [events]);
  const weeks = useMemo(() => monthGridWeeks(viewMonth), [viewMonth]);
  const today = todayISO();

  const select = useCallback(
    (date: string | null) => {
      onSelect(date);
      if (date && date.slice(0, 7) !== viewMonth) {
        setDir(date.slice(0, 7) > viewMonth ? 1 : -1);
        setViewMonth(date.slice(0, 7));
      }
    },
    [onSelect, viewMonth]
  );

  function step(delta: number) {
    setDir(delta);
    setViewMonth((m) => addMonthsISO(m, delta));
  }

  /* Esc closes the day panel; arrow keys walk days. Bound only while a day
     is selected so the grid never hijacks page scrolling. */
  useEffect(() => {
    if (!selected) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        select(null);
        return;
      }
      const delta =
        e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" ? -7 : e.key === "ArrowDown" ? 7 : 0;
      if (delta !== 0 && selected) {
        e.preventDefault();
        const next = new Date(Date.parse(selected) + delta * 86_400_000).toISOString().slice(0, 10);
        select(next);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, select]);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" aria-label="Previous month" onClick={() => step(-1)}>
          <ChevronLeft />
        </Button>
        <span className="min-w-36 text-center text-section tabular-nums" aria-live="polite">
          {monthTitle(viewMonth)}
        </span>
        <Button variant="ghost" size="icon-sm" aria-label="Next month" onClick={() => step(1)}>
          <ChevronRight />
        </Button>
        {viewMonth !== today.slice(0, 7) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              setDir(today.slice(0, 7) > viewMonth ? 1 : -1);
              setViewMonth(today.slice(0, 7));
            }}
          >
            Today
          </Button>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1 pb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-1.5 text-label text-subtle uppercase">
            {d}
          </div>
        ))}
      </div>

      <div className="overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={viewMonth}
            initial={reduce ? false : { x: dir * 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? undefined : { x: dir * -24, opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
            className="grid grid-cols-7 gap-1"
          >
            {weeks.flat().map((date, i) => {
              const inMonth = date.slice(0, 7) === viewMonth;
              const isToday = date === today;
              const isSelected = date === selected;
              const dayEvents = byDate.get(date) ?? [];
              const shown = dayEvents.slice(0, 3);
              const extra = dayEvents.length - shown.length;
              return (
                <motion.button
                  key={date}
                  type="button"
                  onClick={() => select(isSelected ? null : date)}
                  aria-label={`${date}, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}`}
                  aria-pressed={isSelected}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduce ? 0 : Math.min(i * 0.02, 0.6), duration: 0.2 }}
                  className={cn(
                    "flex min-h-[76px] flex-col items-start rounded-lg border border-transparent p-1.5 text-left outline-none",
                    "transition-colors duration-200 hover:bg-background/70 focus-visible:ring-2 focus-visible:ring-ring/60",
                    !inMonth && "opacity-40",
                    isSelected && "border-foreground bg-background ring-1 ring-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-meta font-medium tabular-nums",
                      isToday ? "bg-green font-semibold text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {Number(date.slice(8))}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="mt-auto flex items-center gap-1 pt-1.5 pl-1">
                      {shown.map((e) => (
                        <EventDot key={e.id} event={e} reduce={reduce} />
                      ))}
                      {extra > 0 && <span className="text-[10px] text-subtle tabular-nums">+{extra}</span>}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-foreground" aria-hidden /> course · study</span>
        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-muted-foreground/40" aria-hidden /> planned session</span>
        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-green" aria-hidden /> milestone</span>
        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-risk" aria-hidden /> deadline · critical path</span>
      </div>
    </div>
  );
}
