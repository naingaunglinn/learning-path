"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeUp, microTransition, staggerParent } from "@/lib/motion";
import { useCollection, useProfile } from "@/lib/use-collection";
import { weeksUntil } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/anim/animated-number";

function KpiCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: number;
  sub: string;
  tone?: "default" | "risk";
}) {
  /* Gold flash when an already-loaded value changes (mount count-up excluded). */
  const [flash, setFlash] = useState(0);
  const prev = useRef<number | null>(null);
  useEffect(() => {
    if (prev.current !== null && prev.current !== value) setFlash((f) => f + 1);
    prev.current = value;
  }, [value]);

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -2, transition: microTransition }}>
      <Card size="sm" className="relative">
        {flash > 0 && (
          <motion.span
            key={flash}
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gold-soft"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
        <CardContent className="relative">
          <div className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
            {label}
          </div>
          <AnimatedNumber
            value={value}
            className={cn(
              "mt-1 block text-[26px] leading-9 font-semibold",
              tone === "risk" && value > 0 && "text-risk"
            )}
          />
          <div className="mt-0.5 truncate text-xs text-muted-foreground" title={sub}>
            {sub}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function KpiCards() {
  const profile = useProfile();
  const portfolio = useCollection("portfolio");
  const networking = useCollection("networking");
  const certifications = useCollection("certifications");
  const courses = useCollection("courses");
  const critical = useCollection("critical");

  const kpis = [
    {
      label: "Projects shipped",
      value: portfolio.length,
      sub: "systems in production",
    },
    {
      label: "Applications sent",
      value: networking.filter((n) => n.status !== "not_contacted").length,
      sub: `of ${networking.length} targets touched`,
    },
    {
      label: "Certs completed",
      value: certifications.length + courses.filter((c) => c.status === "completed").length,
      sub: "courses + certificates",
    },
    {
      label: "Weeks to target",
      value: Math.max(0, weeksUntil(profile.targetDate)),
      sub: profile.targetLabel,
    },
    {
      label: "Critical path",
      value: critical.filter((c) => c.status !== "done").length,
      sub: "time-sensitive items open",
      tone: "risk" as const,
    },
    {
      label: "Courses active",
      value: courses.filter((c) => c.status === "in_progress").length,
      sub: `of ${courses.length} in roadmap`,
    },
  ];

  return (
    <motion.div
      variants={staggerParent}
      className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
    >
      {kpis.map((k) => (
        <KpiCard key={k.label} {...k} />
      ))}
    </motion.div>
  );
}
