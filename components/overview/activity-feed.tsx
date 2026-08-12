"use client";

import { motion } from "motion/react";
import {
  Check,
  PackageCheck,
  Pencil,
  Plus,
  Sprout,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerParent } from "@/lib/motion";
import type { ActivityEvent } from "@/lib/schemas";
import { useCollection } from "@/lib/use-collection";
import { relativeTime } from "@/lib/dates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ICON: Record<ActivityEvent["kind"], LucideIcon> = {
  created: Plus,
  updated: Pencil,
  completed: Check,
  shipped: PackageCheck,
  removed: Trash2,
  imported: Upload,
  seeded: Sprout,
};

export function ActivityFeed() {
  const activity = useCollection("activity");
  const events = activity.slice(0, 12);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Everything you change lands here</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Quiet so far — complete a course, clear a blocker, or log an achievement and it shows up here.
          </p>
        ) : (
          <motion.ul variants={staggerParent} initial="hidden" animate="show">
            {events.map((e) => {
              const Icon = ICON[e.kind];
              const win = e.kind === "completed" || e.kind === "shipped";
              return (
                <motion.li
                  key={e.id}
                  variants={fadeUp}
                  className="flex items-center gap-2.5 border-b border-border/60 py-2 first:pt-0 last:border-0 last:pb-0"
                >
                  <Icon
                    className={cn("size-3.5 shrink-0", win ? "text-gold-ink" : "text-muted-foreground")}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px]" title={e.message}>
                    {e.message}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums" suppressHydrationWarning>
                    {relativeTime(e.at)}
                  </span>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </CardContent>
    </Card>
  );
}
