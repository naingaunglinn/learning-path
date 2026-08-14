"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fadeIn } from "@/lib/motion";
import type { Milestone } from "@/lib/schemas";
import { milestoneKinds, milestoneStatuses } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { useCollection, useProfile } from "@/lib/use-collection";
import { currentMonthIndex, monthISOForIndex } from "@/lib/aid";
import { formatMonth } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { SectionHeader } from "@/components/shared/section-header";

function MilestoneDialog({
  open,
  milestone,
  defaultMonth,
  onOpenChange,
}: {
  open: boolean;
  milestone: Milestone | null;
  defaultMonth: string;
  onOpenChange: (open: boolean) => void;
}) {
  const profile = useProfile();
  const [draft, setDraft] = useState({
    month: defaultMonth,
    title: "",
    detail: "",
    kind: "milestone" as Milestone["kind"],
    status: "upcoming" as Milestone["status"],
  });
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(
        milestone
          ? { month: milestone.month, title: milestone.title, detail: milestone.detail, kind: milestone.kind, status: milestone.status }
          : { month: defaultMonth, title: "", detail: "", kind: "milestone", status: "upcoming" }
      );
    }
  }, [open, milestone, defaultMonth]);

  function save() {
    if (!draft.title.trim()) return;
    const clean = { ...draft, title: draft.title.trim() };
    if (milestone) {
      stores.milestones.update(milestone.id, clean);
      if (clean.status === "done" && milestone.status !== "done") {
        logActivity("completed", `Milestone reached: ${clean.title}`);
        toast.success("Milestone marked done");
      } else {
        logActivity("updated", `Milestone updated: ${clean.title}`);
        toast.success("Milestone updated");
      }
    } else {
      stores.milestones.create({ ...clean, tags: [] });
      logActivity("created", `Milestone added: ${clean.title}`);
      toast.success("Milestone added");
    }
    onOpenChange(false);
  }

  const months = Array.from({ length: profile.timelineMonths }, (_, i) => monthISOForIndex(profile, i + 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{milestone ? "Edit milestone" : "Add milestone"}</DialogTitle>
          <DialogDescription>Decision points get the flagged diamond treatment.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ms-title">Title</Label>
            <Input id="ms-title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ms-detail">Detail</Label>
            <Textarea id="ms-detail" rows={2} value={draft.detail} onChange={(e) => setDraft((d) => ({ ...d, detail: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Month</Label>
              <Select value={draft.month} onValueChange={(v) => setDraft((d) => ({ ...d, month: v }))}>
                <SelectTrigger aria-label="Month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m, i) => (
                    <SelectItem key={m} value={m}>
                      M{i + 1} · {formatMonth(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Kind</Label>
              <Select value={draft.kind} onValueChange={(v) => setDraft((d) => ({ ...d, kind: v as Milestone["kind"] }))}>
                <SelectTrigger aria-label="Kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {milestoneKinds.map((k) => (
                    <SelectItem key={k} value={k} className="capitalize">
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft((d) => ({ ...d, status: v as Milestone["status"] }))}>
                <SelectTrigger aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {milestoneStatuses.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {milestone ? (
            <Button variant="destructive" onClick={() => setConfirm(true)}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{milestone ? "Save" : "Add"}</Button>
          </div>
        </DialogFooter>
        {milestone && (
          <ConfirmDelete
            open={confirm}
            onOpenChange={setConfirm}
            what={milestone.title}
            onConfirm={() => {
              stores.milestones.remove(milestone.id);
              logActivity("removed", `Milestone removed: ${milestone.title}`);
              toast("Milestone removed");
              setConfirm(false);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/* Gantt-style bar — a black rounded pill on the month grid.
   Done bars go green; decision points are outlined. */
function Bar({
  milestone,
  col,
  span,
  row,
  onClick,
}: {
  milestone: Milestone;
  col: number;
  span: number;
  row: number;
  onClick: () => void;
}) {
  const done = milestone.status === "done";
  const decision = milestone.kind === "decision";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ gridColumn: `${col} / span ${span}`, gridRow: row }}
      title={`${milestone.title}${decision ? " · decision point" : ""}${milestone.detail ? `\n${milestone.detail}` : ""}`}
      aria-label={`${decision ? "Decision" : "Milestone"}: ${milestone.title}, ${milestone.status}`}
      className={cn(
        "z-20 mr-1.5 flex h-[30px] min-w-0 items-center self-center rounded-full px-3.5 outline-none",
        "transition-transform duration-200 hover:scale-[1.015] focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2",
        done
          ? "bg-green text-foreground"
          : decision
            ? "border-[1.5px] border-foreground bg-card text-foreground"
            : "bg-foreground text-background"
      )}
    >
      <span className="truncate text-[11.5px] font-semibold">{milestone.title}</span>
    </button>
  );
}

export function Timeline() {
  const profile = useProfile();
  const milestones = useCollection("milestones");
  const [dialog, setDialog] = useState<{ open: boolean; milestone: Milestone | null }>({
    open: false,
    milestone: null,
  });

  const nowIdx = currentMonthIndex(profile);
  const months = Array.from({ length: profile.timelineMonths }, (_, i) => {
    const iso = monthISOForIndex(profile, i + 1);
    return { idx: i + 1, iso, items: milestones.filter((m) => m.month === iso) };
  });
  const doneCount = milestones.filter((m) => m.status === "done").length;

  const nowISO = monthISOForIndex(profile, Math.max(1, nowIdx));
  const upcoming = milestones
    .filter((m) => m.status === "upcoming" && m.month >= nowISO)
    .sort((a, b) => a.month.localeCompare(b.month));
  const nextMilestone = upcoming.find((m) => m.kind === "milestone");
  const nextDecision = upcoming.find((m) => m.kind === "decision");

  /* Waterfall: chronological order, one row per milestone. */
  const colByISO = new Map(months.map((m) => [m.iso, m.idx]));
  const sorted = [...milestones].sort(
    (a, b) => a.month.localeCompare(b.month) || a.title.localeCompare(b.title)
  );
  const rows = Math.max(sorted.length, 3);
  const BAR_SPAN = 4;

  function axisLabel(iso: string): string {
    const d = new Date(iso + "-01T00:00:00");
    return `${d.toLocaleDateString("en-US", { month: "short" })} ’${String(d.getFullYear()).slice(2)}`;
  }

  return (
    <section className="space-y-3" aria-label="Timeline and milestones">
      <SectionHeader
        title="Timeline & milestones"
        count={milestones.length}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">{doneCount} done</span>
            <Button size="xs" variant="outline" onClick={() => setDialog({ open: true, milestone: null })}>
              <Plus data-icon="inline-start" /> Add milestone
            </Button>
          </div>
        }
      />
      <Card>
        <CardContent className="space-y-4">
          {(nextMilestone || nextDecision) && (
            <p className="text-body-sm text-muted-foreground">
              {nextMilestone && (
                <>
                  Next milestone: <span className="font-semibold text-foreground">{nextMilestone.title}</span>{" "}
                  <span className="tabular-nums">({formatMonth(nextMilestone.month)})</span>
                </>
              )}
              {nextMilestone && nextDecision && " · "}
              {nextDecision && (
                <>
                  Next decision: <span className="font-semibold text-foreground">{nextDecision.title}</span>{" "}
                  <span className="tabular-nums">({formatMonth(nextDecision.month)})</span>
                </>
              )}
            </p>
          )}
          <div className="overflow-x-auto">
            <motion.div variants={fadeIn} initial="hidden" animate="show" className="min-w-[900px]">
              {/* waterfall chart */}
              <div
                className="relative grid"
                style={{
                  gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))`,
                  gridAutoRows: "38px",
                }}
              >
                {/* dashed month gridlines */}
                {months.map(({ idx }) => (
                  <div
                    key={`grid-${idx}`}
                    aria-hidden
                    className={cn("pointer-events-none border-dashed border-border", idx > 1 && "border-l")}
                    style={{ gridColumn: idx, gridRow: `1 / span ${rows}` }}
                  />
                ))}
                {/* now marker */}
                {nowIdx >= 1 && nowIdx <= months.length && (
                  <div
                    aria-hidden
                    className="pointer-events-none z-10 border-l-2 border-green"
                    style={{ gridColumn: nowIdx, gridRow: `1 / span ${rows}` }}
                  />
                )}
                {sorted.map((m, i) => {
                  const col = Math.min(colByISO.get(m.month) ?? 1, months.length);
                  const span = Math.min(BAR_SPAN, months.length - col + 1);
                  return (
                    <Bar
                      key={m.id}
                      milestone={m}
                      col={col}
                      span={span}
                      row={i + 1}
                      onClick={() => setDialog({ open: true, milestone: m })}
                    />
                  );
                })}
              </div>
              {/* month axis */}
              <div
                className="mt-2 grid border-t pt-2"
                style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}
              >
                {months.map(({ idx, iso }) => (
                  <div
                    key={iso}
                    className={cn(
                      "text-[10px] whitespace-nowrap tabular-nums",
                      idx === nowIdx ? "font-bold text-green-ink" : "text-subtle"
                    )}
                  >
                    {axisLabel(iso)}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          <div className="flex items-center gap-3 text-[10.5px] text-muted-foreground">
            <span className="inline-flex h-5 items-center rounded-full bg-foreground px-2.5 font-medium text-background">
              milestone
            </span>
            <span className="inline-flex h-5 items-center rounded-full border-[1.5px] border-foreground bg-card px-2.5 font-medium">
              decision
            </span>
            <span className="inline-flex h-5 items-center rounded-full bg-green px-2.5 font-medium text-foreground">
              done
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-0.5 bg-green" aria-hidden /> now
            </span>
            <span className="ml-auto hidden text-subtle sm:block">click a bar to edit</span>
          </div>
        </CardContent>
      </Card>
      <MilestoneDialog
        open={dialog.open}
        milestone={dialog.milestone}
        defaultMonth={monthISOForIndex(profile, Math.min(Math.max(nowIdx, 1), profile.timelineMonths))}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
    </section>
  );
}
