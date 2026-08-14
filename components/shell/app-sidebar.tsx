"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isActivePath, navSections, type NavItem } from "@/lib/nav";
import { useCollection, useProfile } from "@/lib/use-collection";

function NavLink({ item, badge }: { item: NavItem; badge?: { value: number; tone: "risk" | "muted" } }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-8 items-center gap-2.5 rounded-full px-3 text-[13px] font-medium outline-none transition-colors duration-200",
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring/60",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="truncate">{item.title}</span>
      {badge && badge.value > 0 && (
        <span
          className={cn(
            "ml-auto tabular-nums",
            badge.tone === "risk"
              ? "inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-risk px-1.5 text-[10px] font-semibold text-white"
              : "text-[11px] font-medium text-sidebar-foreground/80"
          )}
        >
          {badge.value}
        </span>
      )}
    </Link>
  );
}

/** Brand, nav, and profile — shared by the desktop rail and the mobile sheet. */
export function SidebarContent() {
  const profile = useProfile();
  const critical = useCollection("critical");
  const weekly = useCollection("weekly");
  const courses = useCollection("courses");

  const openCritical = critical.filter((c) => c.status !== "done").length;
  const openThisWeek = weekly.filter((w) => !w.done).length;
  const coursesInProgress = courses.filter((c) => c.status === "in_progress").length;

  const badges: Record<string, { value: number; tone: "risk" | "muted" }> = {
    "/tracker": { value: openCritical, tone: "risk" },
    "/week": { value: openThisWeek, tone: "muted" },
    "/learning": { value: coursesInProgress, tone: "muted" },
  };

  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-5 pt-6 pb-5">
        <Link href="/" className="block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/60">
          <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.24em] text-subtle">
            <span className="size-1.5 bg-green" aria-hidden />
            CAREER
          </span>
          <span className="mt-0.5 block text-[15px] font-bold tracking-[-0.01em] text-white">
            Command Center
          </span>
        </Link>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-2.5">
        {navSections.map((section, i) => (
          <div key={section.label ?? i}>
            {section.label && (
              <div className="px-2.5 pt-5 pb-1.5 text-[11px] font-medium tracking-[0.12em] text-subtle/80 uppercase">
                {section.label}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavLink key={item.href} item={item} badge={badges[item.href]} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-[11px] font-semibold text-sidebar-primary-foreground"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium leading-tight text-white">{profile.name}</div>
            <div className="truncate text-xs leading-tight text-sidebar-foreground">
              {profile.role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  /* Lives on the dark shell itself — the content sheet floats beside it. */
  return (
    <aside className="hidden h-full w-60 shrink-0 md:block">
      <SidebarContent />
    </aside>
  );
}
