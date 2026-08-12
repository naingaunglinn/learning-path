"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarPlus,
  FileText,
  GraduationCap,
  ListPlus,
  Plus,
  Target,
  TriangleAlert,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { microTransition } from "@/lib/motion";
import type { WeeklyItem } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { useCollection } from "@/lib/use-collection";
import { addDaysISO, formatDay, isoWeekNumber, weekStartISO } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Chip } from "@/components/shared/chip";

const REF_ICON: Record<WeeklyItem["refType"], LucideIcon> = {
  gap_project: Target,
  course: GraduationCap,
  networking: Users,
  critical: TriangleAlert,
  resume_fix: FileText,
  custom: Plus,
};

const REF_LABEL: Record<WeeklyItem["refType"], string> = {
  gap_project: "project",
  course: "course",
  networking: "outreach",
  critical: "critical path",
  resume_fix: "resume",
  custom: "custom",
};

type Candidate = {
  refType: WeeklyItem["refType"];
  refId: string;
  title: string;
  group: string;
};

function PullDialog({
  open,
  onOpenChange,
  currentItems,
  weekStart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentItems: WeeklyItem[];
  weekStart: string;
}) {
  const gaps = useCollection("gapProjects");
  const courses = useCollection("courses");
  const networking = useCollection("networking");
  const critical = useCollection("critical");
  const fixes = useCollection("resumeFixes");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const candidates: Candidate[] = useMemo(() => {
    const list: Candidate[] = [];
    for (const c of critical.filter((c) => c.status !== "done")) {
      list.push({ refType: "critical", refId: c.id, title: c.title, group: "Critical path" });
    }
    for (const g of gaps.filter((g) => g.status !== "shipped")) {
      list.push({ refType: "gap_project", refId: g.id, title: `Advance: ${g.title}`, group: "Skill-gap projects" });
    }
    for (const c of courses.filter((c) => c.status !== "completed")) {
      list.push({ refType: "course", refId: c.id, title: `Course: ${c.title}`, group: "Learning" });
    }
    for (const n of networking.filter((n) => ["not_contacted", "applied", "in_conversation"].includes(n.status))) {
      list.push({
        refType: "networking",
        refId: n.id,
        title: n.status === "not_contacted" ? `Reach out — ${n.name}` : `Follow up — ${n.name}`,
        group: "Networking",
      });
    }
    for (const f of fixes.filter((f) => f.status === "open")) {
      list.push({ refType: "resume_fix", refId: f.id, title: `Resume: ${f.title}`, group: "Resume fixes" });
    }
    return list;
  }, [gaps, courses, networking, critical, fixes]);

  const alreadyIn = new Set(currentItems.map((i) => `${i.refType}:${i.refId}`));
  const groups = [...new Set(candidates.map((c) => c.group))];

  function toggle(key: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function add() {
    let count = 0;
    for (const c of candidates) {
      const key = `${c.refType}:${c.refId}`;
      if (!selected.has(key) || alreadyIn.has(key)) continue;
      stores.weekly.create({
        weekStart,
        title: c.title,
        refType: c.refType,
        refId: c.refId,
        done: false,
        carriedOver: 0,
        tags: [],
      });
      count++;
    }
    if (count > 0) {
      logActivity("created", `${count} item${count > 1 ? "s" : ""} pulled into this week`);
      toast.success(`${count} item${count > 1 ? "s" : ""} added to this week`);
    }
    setSelected(new Set());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pull from the plan</DialogTitle>
          <DialogDescription>Pick focus items from any section. Already-added items are locked.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group}>
              <div className="mb-1.5 text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                {group}
              </div>
              <div className="space-y-1">
                {candidates
                  .filter((c) => c.group === group)
                  .map((c) => {
                    const key = `${c.refType}:${c.refId}`;
                    const locked = alreadyIn.has(key);
                    return (
                      <label
                        key={key}
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-1.5 text-[13px] transition-colors duration-200",
                          locked
                            ? "cursor-default border-border/60 text-muted-foreground/60"
                            : selected.has(key)
                              ? "border-foreground/40 bg-secondary/60"
                              : "hover:bg-muted/60"
                        )}
                      >
                        <Checkbox
                          checked={locked || selected.has(key)}
                          disabled={locked}
                          onCheckedChange={() => toggle(key)}
                          aria-label={c.title}
                        />
                        <span className="min-w-0 flex-1 truncate">{c.title}</span>
                        {locked && <span className="text-[10px] uppercase">in week</span>}
                      </label>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={add} disabled={selected.size === 0}>
            Add {selected.size > 0 && `(${selected.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WeekView() {
  const all = useCollection("weekly");
  const [pullOpen, setPullOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");

  const monday = weekStartISO();
  const current = all.filter((i) => i.weekStart === monday);
  const past = all.filter((i) => i.weekStart < monday);
  const carryable = past.filter((i) => !i.done);
  const done = current.filter((i) => i.done).length;
  const carriedCount = current.filter((i) => i.carriedOver > 0).length;

  const sorted = [...current].sort(
    (a, b) => Number(a.done) - Number(b.done) || a.createdAt.localeCompare(b.createdAt)
  );

  function toggle(item: WeeklyItem, checked: boolean) {
    stores.weekly.update(item.id, { done: checked });
    if (checked) {
      logActivity("completed", `Done this week: ${item.title}`);
      toast.success("Done", { description: item.title });
    }
  }

  function quickAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = quickTitle.trim();
    if (!title) return;
    stores.weekly.create({
      weekStart: monday,
      title,
      refType: "custom",
      refId: null,
      done: false,
      carriedOver: 0,
      tags: [],
    });
    logActivity("created", `Week item added: ${title}`);
    setQuickTitle("");
  }

  function carryOver() {
    for (const item of carryable) {
      stores.weekly.update(item.id, { weekStart: monday, carriedOver: item.carriedOver + 1 });
    }
    logActivity("updated", `${carryable.length} item${carryable.length > 1 ? "s" : ""} carried into week of ${formatDay(monday)}`);
    toast.success(`Carried over ${carryable.length} item${carryable.length > 1 ? "s" : ""}`);
  }

  function remove(item: WeeklyItem) {
    stores.weekly.remove(item.id);
    toast("Removed from this week");
  }

  return (
    <div className="space-y-4">
      <Card size="sm">
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div>
              <div className="text-sm font-semibold">
                Week of {formatDay(monday)}–{formatDay(addDaysISO(monday, 6))}
              </div>
              <div className="text-xs text-muted-foreground tabular-nums" suppressHydrationWarning>
                Wk {isoWeekNumber(monday)}
                {carriedCount > 0 && ` · ${carriedCount} carried over`}
              </div>
            </div>
            <div className="flex min-w-[160px] flex-1 items-center gap-2.5">
              <Progress value={current.length ? (done / current.length) * 100 : 0} aria-label="Week progress" className="flex-1" />
              <span className="text-xs text-muted-foreground tabular-nums">
                {done}/{current.length}
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setPullOpen(true)}>
              <ListPlus data-icon="inline-start" /> Pull from plan
            </Button>
          </div>
          <form onSubmit={quickAdd} className="flex items-center gap-2">
            <Input
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Add a focus item for this week…"
              aria-label="New week item"
              className="h-8"
            />
            <Button type="submit" size="sm" disabled={!quickTitle.trim()}>
              <CalendarPlus data-icon="inline-start" /> Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {carryable.length > 0 && (
        <Card size="sm" className="border-gold/50 bg-gold-soft/40">
          <CardContent className="flex flex-wrap items-center gap-3">
            <span className="text-[13px]">
              <span className="font-semibold tabular-nums">{carryable.length}</span> unfinished item
              {carryable.length > 1 ? "s" : ""} from last week
            </span>
            <Button size="xs" onClick={carryOver}>
              Carry over
            </Button>
            <span className="text-xs text-muted-foreground">
              Carrying increments each item’s carry-over count — chronic carriers get visible.
            </span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          {sorted.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm font-medium">The week is a blank slate.</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Pull items from the critical path, projects, courses, or networking — or type a custom
                focus above. This is the Monday ritual.
              </p>
            </div>
          ) : (
            <ul>
              <AnimatePresence initial={false}>
                {sorted.map((item) => {
                  const Icon = REF_ICON[item.refType];
                  return (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={microTransition}
                      className="group flex items-center gap-2.5 border-b border-border/60 py-2.5 first:pt-0 last:border-0 last:pb-0"
                    >
                      <Checkbox
                        checked={item.done}
                        onCheckedChange={(v) => toggle(item, v === true)}
                        aria-label={`Mark “${item.title}” ${item.done ? "not done" : "done"}`}
                      />
                      <Icon
                        className={cn("size-3.5 shrink-0", item.refType === "critical" ? "text-risk" : "text-muted-foreground")}
                        aria-hidden
                      />
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-[13px]",
                          item.done && "text-muted-foreground line-through"
                        )}
                        title={item.title}
                      >
                        {item.title}
                      </span>
                      {item.carriedOver > 0 && (
                        <Chip tone="gold" title={`Carried over ${item.carriedOver} time${item.carriedOver > 1 ? "s" : ""}`}>
                          ×{item.carriedOver}
                        </Chip>
                      )}
                      <span className="hidden text-[10px] tracking-[0.06em] text-muted-foreground/70 uppercase sm:block">
                        {REF_LABEL[item.refType]}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Remove “${item.title}”`}
                        className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
                        onClick={() => remove(item)}
                      >
                        <X />
                      </Button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </CardContent>
      </Card>

      <PullDialog open={pullOpen} onOpenChange={setPullOpen} currentItems={current} weekStart={monday} />
    </div>
  );
}
