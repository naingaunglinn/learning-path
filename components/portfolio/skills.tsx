"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Skill } from "@/lib/schemas";
import { proficiencies } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { useCollection } from "@/lib/use-collection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Chip } from "@/components/shared/chip";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { SectionHeader } from "@/components/shared/section-header";

const PROF_ORDER: Record<Skill["proficiency"], number> = {
  expert: 0,
  proficient: 1,
  working: 2,
  learning: 3,
};

function ProficiencyBadge({ level }: { level: Skill["proficiency"] }) {
  return (
    <Chip tone={level === "expert" ? "win" : level === "learning" ? "ghost" : "neutral"} className="uppercase">
      {level}
    </Chip>
  );
}

type Draft = Omit<Skill, "id" | "createdAt" | "updatedAt">;
const EMPTY: Draft = { name: "", proficiency: "working", yearsUsed: 1, proofPointIds: [], tags: [] };

function SkillDialog({
  open,
  skill,
  onOpenChange,
}: {
  open: boolean;
  skill: Skill | null;
  onOpenChange: (open: boolean) => void;
}) {
  const projects = useCollection("portfolio");
  const achievements = useCollection("achievements");
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (open) setDraft(skill ? { ...skill } : EMPTY);
  }, [open, skill]);

  function toggleProof(id: string) {
    setDraft((d) => ({
      ...d,
      proofPointIds: d.proofPointIds.includes(id)
        ? d.proofPointIds.filter((p) => p !== id)
        : [...d.proofPointIds, id],
    }));
  }

  function save() {
    if (!draft.name.trim()) return;
    const clean = { ...draft, name: draft.name.trim(), yearsUsed: Math.max(0, draft.yearsUsed) };
    if (skill) {
      stores.skills.update(skill.id, clean);
      toast.success("Skill updated");
    } else {
      stores.skills.create(clean);
      logActivity("created", `Skill added: ${clean.name}`);
      toast.success("Skill added");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{skill ? "Edit skill" : "Add skill"}</DialogTitle>
          <DialogDescription>Link proof points so every claim has evidence behind it.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sk-name">Skill</Label>
            <Input id="sk-name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Proficiency</Label>
              <Select
                value={draft.proficiency}
                onValueChange={(v) => setDraft((d) => ({ ...d, proficiency: v as Skill["proficiency"] }))}
              >
                <SelectTrigger aria-label="Proficiency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {proficiencies.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sk-years">Years used</Label>
              <Input
                id="sk-years"
                type="number"
                min={0}
                step={0.5}
                value={draft.yearsUsed}
                onChange={(e) => setDraft((d) => ({ ...d, yearsUsed: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Proof points</Label>
            <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border p-2">
              {projects.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-[13px] hover:bg-muted/60">
                  <Checkbox
                    checked={draft.proofPointIds.includes(p.id)}
                    onCheckedChange={() => toggleProof(p.id)}
                    aria-label={p.title}
                  />
                  <span className="truncate">{p.title}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground uppercase">project</span>
                </label>
              ))}
              {achievements.map((a) => (
                <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-[13px] hover:bg-muted/60">
                  <Checkbox
                    checked={draft.proofPointIds.includes(a.id)}
                    onCheckedChange={() => toggleProof(a.id)}
                    aria-label={a.context}
                  />
                  <span className="truncate">
                    {a.value} — {a.context}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground uppercase">number</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{skill ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Skills() {
  const skills = useCollection("skills");
  const projects = useCollection("portfolio");
  const achievements = useCollection("achievements");
  const [dialog, setDialog] = useState<{ open: boolean; skill: Skill | null }>({ open: false, skill: null });
  const [confirm, setConfirm] = useState<Skill | null>(null);

  const sorted = [...skills].sort(
    (a, b) => PROF_ORDER[a.proficiency] - PROF_ORDER[b.proficiency] || b.yearsUsed - a.yearsUsed
  );

  function proofLabel(id: string): string | null {
    return projects.find((p) => p.id === id)?.title ?? achievements.find((a) => a.id === id)?.value ?? null;
  }

  return (
    <section className="space-y-3" aria-label="Skills inventory">
      <SectionHeader
        title="Skills inventory"
        count={skills.length}
        action={
          <Button size="xs" variant="outline" onClick={() => setDialog({ open: true, skill: null })}>
            <Plus data-icon="inline-start" /> Add skill
          </Button>
        }
      />
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Proficiency</TableHead>
                <TableHead className="text-right">Years</TableHead>
                <TableHead className="hidden md:table-cell">Proof points</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <ProficiencyBadge level={s.proficiency} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{s.yearsUsed}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {s.proofPointIds.map((id) => {
                        const label = proofLabel(id);
                        return label ? (
                          <span key={id} className="inline-flex h-5 max-w-44 items-center truncate rounded-full bg-foreground px-2 text-[10px] font-medium text-background">
                            {label}
                          </span>
                        ) : null;
                      })}
                      {s.proofPointIds.length === 0 && (
                        <span className="text-[11px] text-muted-foreground/60">no proof linked</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${s.name}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setDialog({ open: true, skill: s })}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(s)}>
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {skills.length === 0 && (
            <p className="pt-2 text-sm text-muted-foreground">No skills logged yet.</p>
          )}
        </CardContent>
      </Card>

      <SkillDialog open={dialog.open} skill={dialog.skill} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))} />
      {confirm && (
        <ConfirmDelete
          open={!!confirm}
          onOpenChange={(o) => !o && setConfirm(null)}
          what={confirm.name}
          onConfirm={() => {
            stores.skills.remove(confirm.id);
            toast("Skill removed");
            setConfirm(null);
          }}
        />
      )}
    </section>
  );
}
