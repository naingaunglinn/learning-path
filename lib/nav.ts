import {
  CalendarCheck2,
  Database,
  GraduationCap,
  LayoutDashboard,
  Library,
  Target,
  TextQuote,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  title: string;
  icon: LucideIcon;
};

export type NavSection = {
  label: string | null;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    label: null,
    items: [{ href: "/", title: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Plan",
    items: [
      { href: "/week", title: "This Week", icon: CalendarCheck2 },
      { href: "/tracker", title: "Action Tracker", icon: Target },
      { href: "/learning", title: "Learning", icon: GraduationCap },
    ],
  },
  {
    label: "Evidence",
    items: [
      { href: "/portfolio", title: "Portfolio", icon: Library },
      { href: "/bullets", title: "Bullet Generator", icon: TextQuote },
    ],
  },
  {
    label: "Workspace",
    items: [{ href: "/data", title: "Data", icon: Database }],
  },
];

export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export function titleForPath(pathname: string): string {
  for (const section of navSections) {
    for (const item of section.items) {
      if (isActivePath(pathname, item.href)) return item.title;
    }
  }
  return "Career Command Center";
}
