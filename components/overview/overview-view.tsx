"use client";

import { motion } from "motion/react";
import { fadeUp, staggerParent } from "@/lib/motion";
import { KpiCards } from "./kpi-cards";
import { MilestoneChart } from "./milestone-chart";
import { CriticalPanel } from "./critical-panel";
import { ActivityFeed } from "./activity-feed";
import { QuickActions } from "./quick-actions";

export function OverviewView() {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="space-y-4">
      <KpiCards />
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <MilestoneChart />
        </motion.div>
        <motion.div variants={fadeUp}>
          <CriticalPanel />
        </motion.div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <ActivityFeed />
        </motion.div>
        <motion.div variants={fadeUp}>
          <QuickActions />
        </motion.div>
      </div>
    </motion.div>
  );
}
