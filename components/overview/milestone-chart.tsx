"use client";

import { useReducedMotion } from "motion/react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCollection, useProfile } from "@/lib/use-collection";
import { currentMonthIndex, monthISOForIndex } from "@/lib/aid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function tickLabel(iso: string): string {
  const d = new Date(iso + "-01T00:00:00");
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return d.getMonth() === 0 ? `${month} ’${String(d.getFullYear()).slice(2)}` : month;
}

function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const done = payload.find((p) => p.dataKey === "done")?.value ?? 0;
  const planned = payload.find((p) => p.dataKey === "planned")?.value ?? 0;
  return (
    <div className="rounded-lg border bg-card px-2.5 py-1.5 text-xs shadow-2">
      <div className="font-medium">{label}</div>
      <div className="mt-0.5 text-muted-foreground tabular-nums">
        {done} done · {planned} planned
      </div>
    </div>
  );
}

export function MilestoneChart() {
  const profile = useProfile();
  const milestones = useCollection("milestones");
  const reduce = useReducedMotion();

  /* With fewer than two milestones closed there is no line worth drawing —
     show the plan at 40% and say so, instead of a flat line that reads as
     a render failure. */
  const doneTotal = milestones.filter((m) => m.status === "done").length;
  const sparse = doneTotal < 2;

  const nowIdx = currentMonthIndex(profile);
  const data = Array.from({ length: profile.timelineMonths }, (_, i) => {
    const iso = monthISOForIndex(profile, i + 1);
    return {
      label: tickLabel(iso),
      planned: milestones.filter((m) => m.month <= iso).length,
      done: milestones.filter((m) => m.month <= iso && m.status === "done").length,
    };
  });
  const nowLabel =
    nowIdx >= 1 && nowIdx <= profile.timelineMonths
      ? data[nowIdx - 1].label
      : undefined;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Milestone completion</CardTitle>
        <CardDescription>Cumulative across the {profile.timelineMonths}-month plan</CardDescription>
        <div className="flex items-center gap-4 pt-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-px w-4 bg-foreground" aria-hidden /> done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-px w-4 border-t border-dashed border-chart-4" aria-hidden /> planned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-px bg-green" aria-hidden /> now
          </span>
        </div>
      </CardHeader>
      <CardContent className="relative h-[248px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e9e9e6" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#6d6d68" }}
              interval={2}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#6d6d68" }}
              domain={[0, Math.max(1, milestones.length)]}
            />
            {!sparse && <Tooltip content={<ChartTip />} cursor={{ stroke: "#E8E8E8" }} />}
            {nowLabel && <ReferenceLine x={nowLabel} stroke="#34d65c" strokeWidth={1.5} />}
            <Line
              type="monotone"
              dataKey="planned"
              stroke="#B5B5B5"
              strokeOpacity={sparse ? 0.4 : 1}
              strokeWidth={1.25}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={!reduce}
              animationDuration={800}
            />
            {!sparse && (
              <Line
                type="monotone"
                dataKey="done"
                stroke="#111211"
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 3, fill: "#111211" }}
                isAnimationActive={!reduce}
                animationDuration={800}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        {sparse && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8">
            <p className="max-w-sm text-center text-body-sm text-muted-foreground">
              Nothing shipped yet. The dashed line is the plan — your line starts when the first
              milestone closes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
