"use client";

import { motion } from "motion/react";
import { fadeUp, staggerParent } from "@/lib/motion";
import { GapProjects } from "./gap-projects";
import { Timeline } from "./timeline";
import { Networking } from "./networking";
import { ResumeFixes } from "./resume-fixes";
import { VisaPanel } from "./visa-panel";
import { CriticalPanel } from "@/components/overview/critical-panel";

export function TrackerView() {
  return (
    <motion.div
      variants={staggerParent}
      initial="hidden"
      animate="show"
      className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="min-w-0 space-y-8">
        <motion.div variants={fadeUp}>
          <Timeline />
        </motion.div>
        <motion.div variants={fadeUp}>
          <GapProjects />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Networking />
        </motion.div>
        <motion.div variants={fadeUp}>
          <ResumeFixes />
        </motion.div>
      </div>
      {/* pinned rail — critical path stays in view */}
      <motion.div variants={fadeUp} className="space-y-4 xl:sticky xl:top-2 xl:self-start">
        <CriticalPanel editable />
        <VisaPanel />
      </motion.div>
    </motion.div>
  );
}
