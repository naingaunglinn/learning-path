"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { microTransition } from "@/lib/motion";
import type { StarStory } from "@/lib/schemas";
import { competencies } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { useCollection } from "@/lib/use-collection";
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

export const COMPETENCY_LABEL: Record<(typeof competencies)[number], string> = {
  system_design: "System design",
  debugging: "Debugging",
  ownership: "Ownership",
  cross_functional_communication: "Cross-functional comms",
  client_management: "Client management",
  delivery: "Delivery",
};

type Draft = Omit<StarStory, "id" | "createdAt" | "updatedAt">;
const EMPTY: Draft = {
  title: "",
  competencyTags: [],
  situation: "",
  task: "",
  action: "",
  result: "",
  tags: [],
};

function StoryDialog({
  open,
  story,
  onOpenChange,
}: {
  open: boolean;
  story: StarStory | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  useEffect(() => {
    if (open) setDraft(story ? { ...story } : EMPTY);
  }, [open, story]);

  function toggleCompetency(c: (typeof competencies)[number]) {
    setDraft((d) => ({
      ...d,
      competencyTags: d.competencyTags.includes(c)
        ? d.competencyTags.filter((x) => x !== c)
        : [...d.competencyTags, c],
    }));
  }

  function save() {
    if (!draft.title.trim()) return;
    const clean = { ...draft, title: draft.title.trim() };
    if (story) {
      stores.stories.update(story.id, clean);
      toast.success("Story updated");
    } else {
      stores.stories.create(clean);
      logActivity("created", `STAR story added: ${clean.title}`);
      toast.success("Story banked");
    }
    onOpenChange(false);
  }

  const fields: Array<{ key: "situation" | "task" | "action" | "result"; label: string; hint: string }> = [
    { key: "situation", label: "Situation", hint: "The context — what was at stake" },
    { key: "task", label: "Task", hint: "What you specifically owned" },
    { key: "action", label: "Action", hint: "What you did, concretely" },
    { key: "result", label: "Result", hint: "What happened — numbers if possible" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{story ? "Edit STAR story" : "Add STAR story"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="st-title">Title</Label>
            <Input id="st-title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Competencies</Label>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {competencies.map((c) => (
                <label key={c} className="flex cursor-pointer items-center gap-1.5 text-[13px]">
                  <Checkbox
                    checked={draft.competencyTags.includes(c)}
                    onCheckedChange={() => toggleCompetency(c)}
                    aria-label={COMPETENCY_LABEL[c]}
                  />
                  {COMPETENCY_LABEL[c]}
                </label>
              ))}
            </div>
          </div>
          {fields.map((f) => (
            <div key={f.key} className="grid gap-2">
              <Label htmlFor={`st-${f.key}`}>{f.label}</Label>
              <Textarea
                id={`st-${f.key}`}
                rows={2}
                placeholder={f.hint}
                value={draft[f.key]}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{story ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StoryRow({ story, onEdit, onDelete }: { story: StarStory; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const parts: Array<[string, string]> = [
    ["Situation", story.situation],
    ["Task", story.task],
    ["Action", story.action],
    ["Result", story.result],
  ];

  return (
    <li className="border-b border-border/60 py-1 first:pt-0 last:border-0 last:pb-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <ChevronDown
            className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")}
            aria-hidden
          />
          <span className="truncate text-[13px] font-medium">{story.title}</span>
          <span className="hidden flex-wrap gap-1 sm:flex">
            {story.competencyTags.map((c) => (
              <span key={c} className="inline-flex h-5 items-center rounded-full bg-foreground px-2 text-[10px] font-medium text-background">
                {COMPETENCY_LABEL[c]}
              </span>
            ))}
          </span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${story.title}`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={microTransition}
            className="overflow-hidden"
          >
            <div className="grid gap-3 py-2 pl-6 sm:grid-cols-2">
              {parts.map(([label, text]) => (
                <div key={label}>
                  <div className="text-label text-muted-foreground uppercase">{label}</div>
                  <p className="mt-1 text-body-sm">{text || "—"}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Stories() {
  const stories = useCollection("stories");
  const [dialog, setDialog] = useState<{ open: boolean; story: StarStory | null }>({ open: false, story: null });
  const [confirm, setConfirm] = useState<StarStory | null>(null);
  const [filter, setFilter] = useState<"all" | (typeof competencies)[number]>("all");

  const visible = filter === "all" ? stories : stories.filter((s) => s.competencyTags.includes(filter));

  return (
    <section className="space-y-3" aria-label="STAR stories">
      <SectionHeader
        title="STAR stories"
        count={stories.length}
        action={
          <Button size="xs" variant="outline" onClick={() => setDialog({ open: true, story: null })}>
            <Plus data-icon="inline-start" /> Add story
          </Button>
        }
      />
      <Card>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by competency">
            {(["all", ...competencies] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                aria-pressed={filter === c}
                className={cn(
                  "h-7 rounded-full px-3 text-chip outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring/60",
                  filter === c ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {c === "all" ? "All" : COMPETENCY_LABEL[c]}
              </button>
            ))}
          </div>
          <ul>
            {visible.map((s) => (
              <StoryRow
                key={s.id}
                story={s}
                onEdit={() => setDialog({ open: true, story: s })}
                onDelete={() => setConfirm(s)}
              />
            ))}
          </ul>
          {visible.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {stories.length === 0
                ? "No stories banked yet. Every good interview answer starts as a STAR story written down."
                : "No stories tagged with this competency."}
            </p>
          )}
        </CardContent>
      </Card>

      <StoryDialog open={dialog.open} story={dialog.story} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
      {confirm && (
        <ConfirmDelete
          open={!!confirm}
          onOpenChange={(o) => !o && setConfirm(null)}
          what={confirm.title}
          onConfirm={() => {
            stores.stories.remove(confirm.id);
            logActivity("removed", `STAR story removed: ${confirm.title}`);
            toast("Story removed");
            setConfirm(null);
          }}
        />
      )}
    </section>
  );
}
