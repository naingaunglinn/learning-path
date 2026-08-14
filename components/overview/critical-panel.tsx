"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCollection } from "@/lib/use-collection";
import { logActivity, stores } from "@/lib/storage";
import { deadlineTone, describeDaysUntil } from "@/lib/aid";
import { formatDay } from "@/lib/dates";
import type { CriticalItem } from "@/lib/schemas";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
import { IconChip } from "@/components/shared/icon-chip";

function CriticalDialog({
  open,
  item,
  onOpenChange,
}: {
  open: boolean;
  item: CriticalItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(item?.title ?? "");
      setDetail(item?.detail ?? "");
      setDeadline(item?.deadline ?? "");
    }
  }, [open, item]);

  function save() {
    if (!title.trim()) return;
    const patch = { title: title.trim(), detail, deadline: deadline || null };
    if (item) {
      stores.critical.update(item.id, patch);
      logActivity("updated", `Critical path updated: ${patch.title}`);
      toast.success("Critical-path item updated");
    } else {
      stores.critical.create({ ...patch, status: "open", tags: [] });
      logActivity("created", `Critical path added: ${patch.title}`);
      toast.success("Added to the critical path");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Edit critical-path item" : "Add critical-path item"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cp-title">Title</Label>
            <Input id="cp-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cp-detail">Detail</Label>
            <Textarea id="cp-detail" value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cp-deadline">Deadline</Label>
            <Input
              id="cp-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{item ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CriticalPanel({ editable = false }: { editable?: boolean }) {
  const critical = useCollection("critical");
  const [dialog, setDialog] = useState<{ open: boolean; item: CriticalItem | null }>({
    open: false,
    item: null,
  });
  const [confirm, setConfirm] = useState<CriticalItem | null>(null);

  const sorted = [...critical].sort((a, b) => {
    const doneDiff = Number(a.status === "done") - Number(b.status === "done");
    if (doneDiff) return doneDiff;
    return (a.deadline ?? "9999") < (b.deadline ?? "9999") ? -1 : 1;
  });
  const open = critical.filter((c) => c.status !== "done").length;

  function toggle(id: string, title: string, done: boolean) {
    stores.critical.update(id, { status: done ? "done" : "open" });
    logActivity(done ? "completed" : "updated", done ? `Critical path cleared: ${title}` : `Critical path reopened: ${title}`);
    if (done) toast.success("Critical-path item cleared");
  }

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2.5">
          <IconChip tone="risk">
            <TriangleAlert />
          </IconChip>
          Critical path
        </CardTitle>
        <CardDescription>Delay is costly</CardDescription>
        <CardAction className="flex items-center gap-1.5">
          {open > 0 && (
            <span className="inline-flex h-5 items-center rounded-md bg-risk-soft px-1.5 text-xs font-semibold text-risk tabular-nums">
              {open}
            </span>
          )}
          {editable && (
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Add critical-path item"
              onClick={() => setDialog({ open: true, item: null })}
            >
              <Plus />
            </Button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul>
          {sorted.map((item) => {
            const done = item.status === "done";
            return (
              <li key={item.id} className="flex items-start gap-2.5 border-b border-border/60 py-3 first:pt-0 last:border-0 last:pb-0">
                <Checkbox
                  checked={done}
                  onCheckedChange={(v) => toggle(item.id, item.title, v === true)}
                  aria-label={`Mark “${item.title}” ${done ? "open" : "done"}`}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "text-[13px] leading-snug font-medium",
                      done && "text-muted-foreground line-through"
                    )}
                    title={item.detail || undefined}
                  >
                    {item.title}
                  </div>
                </div>
                {item.deadline && !done && (
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 text-[11px] font-medium whitespace-nowrap tabular-nums",
                      deadlineTone(item.deadline) === "risk" ? "text-risk" : "text-muted-foreground"
                    )}
                  >
                    {formatDay(item.deadline)} · {describeDaysUntil(item.deadline)}
                  </span>
                )}
                {editable && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${item.title}`}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setDialog({ open: true, item })}>
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(item)}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </li>
            );
          })}
        </ul>
        {critical.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing is blocking. Add critical-path items from the Action Tracker.
          </p>
        )}
      </CardContent>

      <CriticalDialog
        open={dialog.open}
        item={dialog.item}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
      {confirm && (
        <ConfirmDelete
          open={!!confirm}
          onOpenChange={(o) => !o && setConfirm(null)}
          what={confirm.title}
          onConfirm={() => {
            stores.critical.remove(confirm.id);
            logActivity("removed", `Critical path removed: ${confirm.title}`);
            toast("Critical-path item removed");
            setConfirm(null);
          }}
        />
      )}
    </Card>
  );
}
