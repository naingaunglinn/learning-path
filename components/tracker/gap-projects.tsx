"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MoreHorizontal, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { rowInOut } from "@/lib/motion";
import type { GapProject } from "@/lib/schemas";
import { gapProjectStatuses } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { useCollection } from "@/lib/use-collection";
import { parseList, joinList } from "@/lib/text";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Chip } from "@/components/shared/chip";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { SectionHeader } from "@/components/shared/section-header";

const STATUS_LABEL: Record<GapProject["status"], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  shipped: "Shipped",
};

type Draft = Omit<GapProject, "id" | "createdAt" | "updatedAt">;

const EMPTY: Draft = {
  title: "",
  gap: "",
  scope: "",
  techStack: [],
  estWeeks: "",
  targetMetric: "",
  status: "not_started",
  progress: 0,
  starred: false,
  tags: [],
};

function GapDialog({
  open,
  project,
  onOpenChange,
}: {
  open: boolean;
  project: GapProject | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (open) {
      setDraft(project ? { ...project } : EMPTY);
      setError(false);
    }
  }, [open, project]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  function save() {
    if (!draft.title.trim()) {
      setError(true);
      return;
    }
    const clean = { ...draft, title: draft.title.trim(), progress: Math.min(100, Math.max(0, draft.progress)) };
    if (project) {
      stores.gapProjects.update(project.id, clean);
      logActivity("updated", `Gap project updated: ${clean.title}`);
      toast.success("Project updated");
    } else {
      stores.gapProjects.create(clean);
      logActivity("created", `Gap project added: ${clean.title}`);
      toast.success("Project added");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "Add skill-gap project"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="gp-title">Title</Label>
            <Input id="gp-title" value={draft.title} onChange={(e) => set("title", e.target.value)} aria-invalid={error} />
            {error && <p className="text-xs text-risk">Title is required.</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gp-gap">Skill gap it closes</Label>
            <Input id="gp-gap" value={draft.gap} onChange={(e) => set("gap", e.target.value)} placeholder="e.g. Production LLM operations" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gp-scope">Scope</Label>
            <Textarea id="gp-scope" rows={3} value={draft.scope} onChange={(e) => set("scope", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="gp-stack">Tech stack (comma-separated)</Label>
              <Input id="gp-stack" value={joinList(draft.techStack)} onChange={(e) => set("techStack", parseList(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gp-weeks">Estimated weeks</Label>
              <Input id="gp-weeks" value={draft.estWeeks} onChange={(e) => set("estWeeks", e.target.value)} placeholder="4–6 wks" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gp-metric">Target metric</Label>
            <Input id="gp-metric" value={draft.targetMetric} onChange={(e) => set("targetMetric", e.target.value)} placeholder="e.g. recall@k tracked per release" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => set("status", v as Draft["status"])}>
                <SelectTrigger aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gapProjectStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gp-progress">Progress %</Label>
              <Input
                id="gp-progress"
                type="number"
                min={0}
                max={100}
                value={draft.progress}
                onChange={(e) => set("progress", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="gp-star">Highest leverage (⭐ pinned first)</Label>
            <Switch id="gp-star" checked={draft.starred} onCheckedChange={(v) => set("starred", v)} />
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

function GapRow({ project, onEdit }: { project: GapProject; onEdit: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const shipped = project.status === "shipped";

  function setStatus(status: GapProject["status"]) {
    const progress = status === "shipped" ? 100 : project.progress;
    stores.gapProjects.update(project.id, { status, progress });
    if (status === "shipped") {
      logActivity("shipped", `Project shipped: ${project.title}`);
      toast.success("Shipped", { description: "Consider logging it as portfolio evidence too." });
    } else {
      logActivity("updated", `Project ${STATUS_LABEL[status].toLowerCase()}: ${project.title}`);
    }
  }

  function toggleStar() {
    stores.gapProjects.update(project.id, { starred: !project.starred });
  }

  return (
    <motion.div layout variants={rowInOut} initial="hidden" animate="show" exit="exit">
      <Card size="sm">
        <CardContent className="space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleStar}
                  aria-label={project.starred ? "Unpin from highest leverage" : "Pin as highest leverage"}
                  aria-pressed={project.starred}
                  className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <Star
                    className={cn(
                      "size-4 transition-colors duration-200",
                      project.starred ? "fill-green stroke-green-ink" : "stroke-muted-foreground/50 hover:stroke-foreground"
                    )}
                  />
                </button>
                <span
                  className={cn("truncate text-sm font-medium", shipped && "text-muted-foreground")}
                  title={[project.gap && `Closes: ${project.gap}`, project.scope].filter(Boolean).join("\n\n")}
                >
                  {project.title}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Select value={project.status} onValueChange={(v) => setStatus(v as GapProject["status"])}>
                <SelectTrigger size="sm" className="h-7 w-[124px] text-chip" aria-label="Project status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gapProjectStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${project.title}`}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={onEdit}>
                    <Pencil /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(true)}>
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {project.estWeeks && <Chip tone="ghost">{project.estWeeks}</Chip>}
            {project.techStack.slice(0, 3).map((t) => (
              <span key={t} className="inline-flex h-5 items-center rounded-full bg-foreground px-2 text-[10px] font-medium text-background">
                {t}
              </span>
            ))}
            {project.targetMetric && (
              <span className="truncate text-meta text-subtle" title={`Target metric: ${project.targetMetric}`}>
                → {project.targetMetric}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Progress
              value={project.progress}
              aria-label={`${project.progress}% complete`}
              className={cn("flex-1", shipped && "[&_[data-slot=progress-indicator]]:bg-green")}
            />
            <span className={cn("w-9 text-right text-xs tabular-nums", shipped ? "font-medium text-green-ink" : "text-muted-foreground")}>
              {project.progress}%
            </span>
          </div>
        </CardContent>
      </Card>

      <ConfirmDelete
        open={confirm}
        onOpenChange={setConfirm}
        what={project.title}
        onConfirm={() => {
          stores.gapProjects.remove(project.id);
          logActivity("removed", `Gap project removed: ${project.title}`);
          toast("Project removed");
        }}
      />
    </motion.div>
  );
}

export function GapProjects() {
  const projects = useCollection("gapProjects");
  const [dialog, setDialog] = useState<{ open: boolean; project: GapProject | null }>({
    open: false,
    project: null,
  });

  const sorted = [...projects].sort(
    (a, b) =>
      Number(b.starred) - Number(a.starred) ||
      Number(a.status === "shipped") - Number(b.status === "shipped") ||
      a.title.localeCompare(b.title)
  );

  return (
    <section className="space-y-3" aria-label="Skill gaps and projects">
      <SectionHeader
        title="Skill gaps → projects"
        count={projects.length}
        action={
          <Button size="xs" variant="outline" onClick={() => setDialog({ open: true, project: null })}>
            <Plus data-icon="inline-start" /> Add project
          </Button>
        }
      />
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {sorted.map((p) => (
            <GapRow key={p.id} project={p} onEdit={() => setDialog({ open: true, project: p })} />
          ))}
        </AnimatePresence>
        {projects.length === 0 && (
          <Card size="sm">
            <CardContent className="text-sm text-muted-foreground">
              No projects yet. Each skill gap gets a project that closes it — add the first one.
            </CardContent>
          </Card>
        )}
      </div>
      <GapDialog
        open={dialog.open}
        project={dialog.project}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
    </section>
  );
}
