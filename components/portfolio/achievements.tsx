"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { rowInOut } from "@/lib/motion";
import type { Achievement } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { useCollection } from "@/lib/use-collection";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { SectionHeader } from "@/components/shared/section-header";

type Draft = Omit<Achievement, "id" | "createdAt" | "updatedAt">;
const EMPTY: Draft = { value: "", context: "", date: null, sourceProjectId: null, tags: [] };

function AchievementDialog({
  open,
  achievement,
  onOpenChange,
}: {
  open: boolean;
  achievement: Achievement | null;
  onOpenChange: (open: boolean) => void;
}) {
  const projects = useCollection("portfolio");
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (open) setDraft(achievement ? { ...achievement } : EMPTY);
  }, [open, achievement]);

  function save() {
    if (!draft.value.trim()) return;
    const clean = { ...draft, value: draft.value.trim() };
    if (achievement) {
      stores.achievements.update(achievement.id, clean);
      toast.success("Achievement updated");
    } else {
      stores.achievements.create(clean);
      logActivity("created", `Achievement logged: ${clean.value}`);
      toast.success("Number logged");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{achievement ? "Edit achievement" : "Log a quantified achievement"}</DialogTitle>
          <DialogDescription>Numbers only — if it can’t be measured, it goes in a STAR story instead.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ac-value">The number</Label>
              <Input id="ac-value" value={draft.value} onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))} placeholder="-38% p95" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ac-context">What it measures</Label>
              <Textarea id="ac-context" rows={2} value={draft.context} onChange={(e) => setDraft((d) => ({ ...d, context: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ac-date">Date</Label>
              <Input
                id="ac-date"
                type="date"
                value={draft.date ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value || null }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Source project</Label>
              <Select
                value={draft.sourceProjectId ?? "none"}
                onValueChange={(v) => setDraft((d) => ({ ...d, sourceProjectId: v === "none" ? null : v }))}
              >
                <SelectTrigger aria-label="Source project">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{achievement ? "Save" : "Log it"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Achievements() {
  const achievements = useCollection("achievements");
  const projects = useCollection("portfolio");
  const [dialog, setDialog] = useState<{ open: boolean; achievement: Achievement | null }>({
    open: false,
    achievement: null,
  });
  const [confirm, setConfirm] = useState<Achievement | null>(null);

  return (
    <section className="space-y-3" aria-label="Quantified achievements">
      <SectionHeader
        title="Quantified achievements"
        count={achievements.length}
        action={
          <Button size="xs" variant="outline" onClick={() => setDialog({ open: true, achievement: null })}>
            <Plus data-icon="inline-start" /> Log number
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false}>
          {achievements.map((a) => {
            const source = a.sourceProjectId ? projects.find((p) => p.id === a.sourceProjectId) : null;
            return (
              <motion.div key={a.id} layout variants={rowInOut} initial="hidden" animate="show" exit="exit">
                <Card size="sm" className="h-full">
                  <CardContent className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex items-baseline gap-1.5 text-xl leading-7 font-semibold tabular-nums">
                        <span aria-hidden className="size-1.5 shrink-0 translate-y-[-3px] bg-gold" />
                        {a.value}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${a.value}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setDialog({ open: true, achievement: a })}>
                            <Pencil /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(a)}>
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.context}</p>
                    {source && (
                      <span className="mt-2 inline-flex h-5 w-fit max-w-full items-center truncate rounded-md border px-1.5 text-[10px] text-muted-foreground">
                        {source.title}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {achievements.length === 0 && (
        <Card size="sm">
          <CardContent className="text-sm text-muted-foreground">
            No numbers yet. Users served, latency shaved, uptime held — log anything measurable.
          </CardContent>
        </Card>
      )}

      <AchievementDialog
        open={dialog.open}
        achievement={dialog.achievement}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
      {confirm && (
        <ConfirmDelete
          open={!!confirm}
          onOpenChange={(o) => !o && setConfirm(null)}
          what={confirm.value}
          onConfirm={() => {
            stores.achievements.remove(confirm.id);
            toast("Achievement removed");
            setConfirm(null);
          }}
        />
      )}
    </section>
  );
}
