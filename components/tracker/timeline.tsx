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
          <div className="grid gap-1.5">
            <Label htmlFor="ms-title">Title</Label>
            <Input id="ms-title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ms-detail">Detail</Label>
            <Textarea id="ms-detail" rows={2} value={draft.detail} onChange={(e) => setDraft((d) => ({ ...d, detail: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
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
            <div className="grid gap-1.5">
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
            <div className="grid gap-1.5">
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

function Node({ milestone, onClick }: { milestone: Milestone; onClick: () => void }) {
  const done = milestone.status === "done";
  const decision = milestone.kind === "decision";
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${milestone.title}${decision ? " (decision point)" : ""}`}
      aria-label={`${decision ? "Decision" : "Milestone"}: ${milestone.title}, ${milestone.status}`}
      className="group flex w-full flex-col items-center gap-1.5 rounded-md pb-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <span
        aria-hidden
        className={cn(
          "block size-2.5 shrink-0 border-[1.5px] bg-card transition-colors duration-200",
          decision ? "rotate-45 rounded-[1px]" : "rounded-full",
          done
            ? "border-gold bg-gold"
            : decision
              ? "border-risk group-hover:bg-risk-soft"
              : "border-foreground/40 group-hover:border-foreground"
        )}
      />
      <span
        className={cn(
          "line-clamp-3 w-full text-center text-[10.5px] leading-[1.35]",
          done ? "text-muted-foreground" : decision ? "font-medium text-risk" : "text-foreground"
        )}
      >
        {milestone.title}
      </span>
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
        <CardContent className="overflow-x-auto">
          <motion.div variants={fadeIn} initial="hidden" animate="show" className="relative min-w-[1560px] pt-2 pb-1">
            {/* the rail */}
            <div aria-hidden className="absolute top-[52px] right-0 left-0 h-px bg-border" />
            <div className="grid" style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}>
              {months.map(({ idx, iso, items }) => {
                const isNow = idx === nowIdx;
                return (
                  <div key={iso} className="flex min-w-0 flex-col items-center px-1">
                    <div
                      className={cn(
                        "flex h-8 flex-col items-center justify-end pb-1 text-[10px] leading-tight",
                        isNow ? "font-semibold text-gold-ink" : "text-muted-foreground"
                      )}
                    >
                      {isNow && <span className="mb-0.5 text-[9px] tracking-[0.12em] uppercase">You are here</span>}
                      <span className="font-medium tabular-nums">M{idx}</span>
                    </div>
                    {/* tick on the rail */}
                    <div
                      aria-hidden
                      className={cn("h-4 w-px", isNow ? "w-[3px] rounded-full bg-gold" : "bg-border")}
                    />
                    <div className={cn("mt-1 text-[10px] tabular-nums", isNow ? "font-medium text-gold-ink" : "text-muted-foreground/80")}>
                      {formatMonth(iso)}
                    </div>
                    <div className="mt-2.5 w-full space-y-2">
                      {items.map((m) => (
                        <Node key={m.id} milestone={m} onClick={() => setDialog({ open: true, milestone: m })} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-4 text-[10.5px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full border-[1.5px] border-foreground/40 bg-card" aria-hidden /> milestone
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rotate-45 rounded-[1px] border-[1.5px] border-risk bg-card" aria-hidden /> decision point
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full border-[1.5px] border-gold bg-gold" aria-hidden /> done
              </span>
            </div>
          </motion.div>
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
