"use client";

import { motion } from "motion/react";
import { fadeUp, staggerParent } from "@/lib/motion";
import { KpiCards } from "./kpi-cards";
import { MilestoneChart } from "./milestone-chart";
import { ActivityFeed } from "./activity-feed";
import { QuickActions } from "./quick-actions";

/* The critical-path panel is deliberately absent here — on the home
   screen it read as pressure. It stays editable on the Action Tracker. */
export function OverviewView() {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="space-y-4">
      <KpiCards />
      <motion.div variants={fadeUp}>
        <MilestoneChart />
      </motion.div>
      <div className="grid gap-4 lg:grid-cols-3">
        {/* min-w-0: grid items otherwise refuse to shrink below their longest
            log line, which breaks truncate and scrolls the phone sideways. */}
        <motion.div variants={fadeUp} className="min-w-0 lg:col-span-2">
          <ActivityFeed />
        </motion.div>
        <motion.div variants={fadeUp} className="min-w-0">
          <QuickActions />
        </motion.div>
      </div>
    </motion.div>
  );
}
