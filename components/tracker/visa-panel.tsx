"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { VisaTrack } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { useCollection } from "@/lib/use-collection";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Chip } from "@/components/shared/chip";
import { ConfirmDelete } from "@/components/shared/confirm-delete";

type Draft = Omit<VisaTrack, "id" | "createdAt" | "updatedAt">;

const EMPTY: Draft = {
  country: "",
  name: "",
  threshold: "",
  requirement: "",
  eligibleNow: false,
  notes: "",
  tags: [],
};

export function VisaPanel() {
  const tracks = useCollection("visaTracks");
  const [dialog, setDialog] = useState<{ open: boolean; track: VisaTrack | null }>({ open: false, track: null });
  const [confirm, setConfirm] = useState<VisaTrack | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (dialog.open) setDraft(dialog.track ? { ...dialog.track } : EMPTY);
  }, [dialog]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  function save() {
    if (!draft.name.trim() || !draft.country.trim()) return;
    const clean = { ...draft, name: draft.name.trim(), country: draft.country.trim() };
    if (dialog.track) {
      stores.visaTracks.update(dialog.track.id, clean);
      toast.success("Visa track updated");
    } else {
      stores.visaTracks.create(clean);
      logActivity("created", `Visa track added: ${clean.country} ${clean.name}`);
      toast.success("Visa track added");
    }
    setDialog({ open: false, track: null });
  }

  const sorted = [...tracks].sort((a, b) => Number(b.eligibleNow) - Number(a.eligibleNow));

  return (
    <Card className="h-fit">
      <CardHeader className="border-b">
        <CardTitle>Visa tracks</CardTitle>
        <CardDescription>Reference — routes into the EU</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-xs" aria-label="Add visa track" onClick={() => setDialog({ open: true, track: null })}>
            <Plus />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul>
          {sorted.map((t) => (
            <li key={t.id} className="border-b border-border/60 py-2.5 first:pt-0 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium">
                  {t.country} · {t.name}
                </span>
                {t.eligibleNow && <Chip tone="gold">eligible now</Chip>}
                <span className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${t.name}`}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setDialog({ open: true, track: t })}>
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(t)}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {t.threshold}
                {t.requirement && ` · ${t.requirement}`}
              </div>
              {t.notes && <div className="mt-0.5 text-xs text-muted-foreground/80">{t.notes}</div>}
            </li>
          ))}
        </ul>
        {tracks.length === 0 && (
          <p className="text-sm text-muted-foreground">No visa tracks captured yet.</p>
        )}
      </CardContent>

      <Dialog open={dialog.open} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog.track ? "Edit visa track" : "Add visa track"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="vt-country">Country</Label>
                <Input id="vt-country" value={draft.country} onChange={(e) => set("country", e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="vt-name">Track name</Label>
                <Input id="vt-name" value={draft.name} onChange={(e) => set("name", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="vt-threshold">Threshold</Label>
              <Input id="vt-threshold" value={draft.threshold} onChange={(e) => set("threshold", e.target.value)} placeholder="e.g. €45,934.20 salary" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="vt-req">Requirement</Label>
              <Input id="vt-req" value={draft.requirement} onChange={(e) => set("requirement", e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="vt-notes">Notes</Label>
              <Textarea id="vt-notes" rows={2} value={draft.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="vt-eligible">Eligible now</Label>
              <Switch id="vt-eligible" checked={draft.eligibleNow} onCheckedChange={(v) => set("eligibleNow", v)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog({ open: false, track: null })}>
              Cancel
            </Button>
            <Button onClick={save}>{dialog.track ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {confirm && (
        <ConfirmDelete
          open={!!confirm}
          onOpenChange={(o) => !o && setConfirm(null)}
          what={`${confirm.country} ${confirm.name}`}
          onConfirm={() => {
            stores.visaTracks.remove(confirm.id);
            toast("Visa track removed");
            setConfirm(null);
          }}
        />
      )}
    </Card>
  );
}
