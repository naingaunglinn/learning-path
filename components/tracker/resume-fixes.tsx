"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ResumeFix } from "@/lib/schemas";
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

export function ResumeFixes() {
  const fixes = useCollection("resumeFixes");
  const [dialog, setDialog] = useState<{ open: boolean; fix: ResumeFix | null }>({ open: false, fix: null });
  const [confirm, setConfirm] = useState<ResumeFix | null>(null);
  const [draft, setDraft] = useState({ title: "", detail: "" });

  useEffect(() => {
    if (dialog.open) setDraft({ title: dialog.fix?.title ?? "", detail: dialog.fix?.detail ?? "" });
  }, [dialog]);

  const open = fixes.filter((f) => f.status === "open").length;

  function toggle(fix: ResumeFix, done: boolean) {
    stores.resumeFixes.update(fix.id, { status: done ? "done" : "open" });
    logActivity(done ? "completed" : "updated", done ? `Resume fix done: ${fix.title}` : `Resume fix reopened: ${fix.title}`);
    if (done) toast.success("Resume fix done");
  }

  function save() {
    if (!draft.title.trim()) return;
    if (dialog.fix) {
      stores.resumeFixes.update(dialog.fix.id, { title: draft.title.trim(), detail: draft.detail });
      toast.success("Resume fix updated");
    } else {
      stores.resumeFixes.create({ title: draft.title.trim(), detail: draft.detail, status: "open", tags: [] });
      logActivity("created", `Resume fix added: ${draft.title.trim()}`);
      toast.success("Resume fix added");
    }
    setDialog({ open: false, fix: null });
  }

  return (
    <section className="space-y-3" aria-label="Resume fixes">
      <SectionHeader
        title="Resume fixes"
        count={open}
        action={
          <Button size="xs" variant="outline" onClick={() => setDialog({ open: true, fix: null })}>
            <Plus data-icon="inline-start" /> Add fix
          </Button>
        }
      />
      <Card>
        <CardContent>
          <ul>
            {fixes.map((fix) => {
              const done = fix.status === "done";
              return (
                <li key={fix.id} className="flex items-start gap-2.5 border-b border-border/60 py-2.5 first:pt-0 last:border-0 last:pb-0">
                  <Checkbox
                    checked={done}
                    onCheckedChange={(v) => toggle(fix, v === true)}
                    aria-label={`Mark “${fix.title}” ${done ? "open" : "done"}`}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-[13px] font-medium leading-snug", done && "text-muted-foreground line-through")}>
                      {fix.title}
                    </div>
                    {fix.detail && !done && <div className="mt-0.5 text-xs text-muted-foreground">{fix.detail}</div>}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${fix.title}`}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setDialog({ open: true, fix })}>
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(fix)}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
          {fixes.length === 0 && (
            <p className="text-sm text-muted-foreground">All clear — nothing flagged on the resume.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialog.open} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog.fix ? "Edit resume fix" : "Add resume fix"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="rf-title">Title</Label>
              <Input id="rf-title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="rf-detail">Detail</Label>
              <Textarea id="rf-detail" rows={3} value={draft.detail} onChange={(e) => setDraft((d) => ({ ...d, detail: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog({ open: false, fix: null })}>
              Cancel
            </Button>
            <Button onClick={save}>{dialog.fix ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {confirm && (
        <ConfirmDelete
          open={!!confirm}
          onOpenChange={(o) => !o && setConfirm(null)}
          what={confirm.title}
          onConfirm={() => {
            stores.resumeFixes.remove(confirm.id);
            logActivity("removed", `Resume fix removed: ${confirm.title}`);
            toast("Resume fix removed");
            setConfirm(null);
          }}
        />
      )}
    </section>
  );
}
