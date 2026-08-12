"use client";

import { usePathname } from "next/navigation";
import { addDaysISO, formatDay, isoWeekNumber, weeksUntil, weekStartISO } from "@/lib/dates";
import { titleForPath } from "@/lib/nav";
import { useProfile } from "@/lib/use-collection";
import { MobileNav } from "./mobile-nav";

export function AppHeader() {
  const pathname = usePathname();
  const profile = useProfile();

  const monday = weekStartISO();
  const weekLabel = `Wk ${isoWeekNumber(monday)} · ${formatDay(monday)}–${formatDay(addDaysISO(monday, 6))}`;
  const wks = weeksUntil(profile.targetDate);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <MobileNav />
          <h1 className="text-[15px] font-semibold tracking-[-0.01em]">{titleForPath(pathname)}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground tabular-nums sm:block" suppressHydrationWarning>
            {weekLabel}
          </span>
          <span
            className="hidden rounded-lg border bg-card px-2 py-1 text-xs tabular-nums sm:block"
            title={`Target: ${profile.targetDate}`}
            suppressHydrationWarning
          >
            <span className="font-semibold">{wks} wks</span>
            <span className="text-muted-foreground"> → {profile.targetLabel}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
