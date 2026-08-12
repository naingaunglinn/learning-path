"use client";

import { motion } from "motion/react";
import { fadeUp, staggerParent } from "@/lib/motion";
import { Projects } from "./projects";
import { Skills } from "./skills";
import { Achievements } from "./achievements";
import { Completions } from "./completions";
import { Stories } from "./stories";

export function PortfolioView() {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <Projects />
      </motion.div>
      <motion.div variants={fadeUp}>
        <Skills />
      </motion.div>
      <motion.div variants={fadeUp}>
        <Achievements />
      </motion.div>
      <motion.div variants={fadeUp}>
        <Completions />
      </motion.div>
      <motion.div variants={fadeUp}>
        <Stories />
      </motion.div>
    </motion.div>
  );
}
