"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { rowInOut } from "@/lib/motion";
import type { PortfolioProject } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { useCollection } from "@/lib/use-collection";
import { formatMonth } from "@/lib/dates";
import { joinLines, joinList, parseLines, parseList } from "@/lib/text";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
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
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { SectionHeader } from "@/components/shared/section-header";

type Draft = Omit<PortfolioProject, "id" | "createdAt" | "updatedAt">;

const EMPTY: Draft = {
  title: "",
  url: "",
  startDate: new Date().toISOString().slice(0, 7),
  endDate: null,
  techStack: [],
  summary: "",
  metrics: [],
  proves: "",
  tags: [],
};

function ProjectDialog({
  open,
  project,
  onOpenChange,
}: {
  open: boolean;
  project: PortfolioProject | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [ongoing, setOngoing] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(project ? { ...project } : EMPTY);
      setOngoing(project ? project.endDate === null : false);
    }
  }, [open, project]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  function save() {
    if (!draft.title.trim()) return;
    const clean = { ...draft, title: draft.title.trim(), endDate: ongoing ? null : draft.endDate };
    if (project) {
      stores.portfolio.update(project.id, clean);
      logActivity("updated", `Portfolio project updated: ${clean.title}`);
      toast.success("Project updated");
    } else {
      stores.portfolio.create(clean);
      logActivity("shipped", `Portfolio evidence added: ${clean.title}`);
      toast.success("Added to the evidence bank");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "Add completed project"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="pp-title">Title</Label>
            <Input id="pp-title" value={draft.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="pp-url">URL</Label>
              <Input id="pp-url" value={draft.url} onChange={(e) => set("url", e.target.value)} inputMode="url" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pp-stack">Tech stack (comma-separated)</Label>
              <Input id="pp-stack" value={joinList(draft.techStack)} onChange={(e) => set("techStack", parseList(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="pp-start">Started</Label>
              <Input id="pp-start" type="month" value={draft.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pp-end">Ended</Label>
              <Input
                id="pp-end"
                type="month"
                value={draft.endDate ?? ""}
                disabled={ongoing}
                onChange={(e) => set("endDate", e.target.value || null)}
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox checked={ongoing} onCheckedChange={(v) => setOngoing(v === true)} /> still in production
              </label>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pp-summary">Summary</Label>
            <Textarea id="pp-summary" rows={2} value={draft.summary} onChange={(e) => set("summary", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pp-metrics">Metrics (one per line)</Label>
            <Textarea
              id="pp-metrics"
              rows={3}
              value={joinLines(draft.metrics)}
              onChange={(e) => set("metrics", parseLines(e.target.value))}
              placeholder={"0 payment-integrity incidents\n4.5+ yrs in production"}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pp-proves">What this proves</Label>
            <Textarea id="pp-proves" rows={2} value={draft.proves} onChange={(e) => set("proves", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{project ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Projects() {
  const projects = useCollection("portfolio");
  const [dialog, setDialog] = useState<{ open: boolean; project: PortfolioProject | null }>({
    open: false,
    project: null,
  });
  const [confirm, setConfirm] = useState<PortfolioProject | null>(null);

  const sorted = [...projects].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <section className="space-y-3" aria-label="Completed projects">
      <SectionHeader
        title="Completed projects"
        count={projects.length}
        action={
          <Button size="xs" variant="outline" onClick={() => setDialog({ open: true, project: null })}>
            <Plus data-icon="inline-start" /> Add project
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence initial={false}>
          {sorted.map((p) => (
            <motion.div key={p.id} layout variants={rowInOut} initial="hidden" animate="show" exit="exit">
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">{p.title}</span>
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open ${p.title}`}
                            className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
                          >
                            <ArrowUpRight className="size-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                        {formatMonth(p.startDate)} – {p.endDate ? formatMonth(p.endDate) : "present"}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${p.title}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setDialog({ open: true, project: p })}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(p)}>
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {p.summary && <p className="text-body-sm text-foreground/90">{p.summary}</p>}

                  <div className="flex flex-wrap gap-1">
                    {p.techStack.map((t) => (
                      <span key={t} className="inline-flex h-5 items-center rounded-full bg-foreground px-2 text-[10px] font-medium text-background">
                        {t}
                      </span>
                    ))}
                  </div>

                  {p.metrics.length > 0 && (
                    <ul className="space-y-1">
                      {p.metrics.map((m) => (
                        <li key={m} className="flex items-baseline gap-2 text-xs text-muted-foreground">
                          <span className="size-1.5 shrink-0 translate-y-[-1px] bg-green" aria-hidden />
                          {m}
                        </li>
                      ))}
                    </ul>
                  )}

                  {p.proves && (
                    <div className="mt-auto border-l-2 border-green pl-2.5">
                      <div className="text-label text-green-ink uppercase">Proves</div>
                      <p className="mt-0.5 text-[13px] leading-snug">{p.proves}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {projects.length === 0 && (
        <Card size="sm">
          <CardContent className="text-sm text-muted-foreground">
            The evidence bank is empty. Add the systems you shipped — with the metrics that prove it.
          </CardContent>
        </Card>
      )}

      <ProjectDialog open={dialog.open} project={dialog.project} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
      {confirm && (
        <ConfirmDelete
          open={!!confirm}
          onOpenChange={(o) => !o && setConfirm(null)}
          what={confirm.title}
          onConfirm={() => {
            stores.portfolio.remove(confirm.id);
            logActivity("removed", `Portfolio project removed: ${confirm.title}`);
            toast("Project removed");
            setConfirm(null);
          }}
        />
      )}
    </section>
  );
}
