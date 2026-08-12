"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Handshake, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { microTransition } from "@/lib/motion";
import type { NetworkingTarget } from "@/lib/schemas";
import { networkingKinds, networkingStatuses } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { useCollection } from "@/lib/use-collection";
import { formatDay, todayISO } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { SectionHeader } from "@/components/shared/section-header";

const KIND_LABEL: Record<NetworkingTarget["kind"], string> = {
  company: "Company",
  community: "Community",
  job_board: "Job board",
};

const STATUS_LABEL: Record<NetworkingTarget["status"], string> = {
  not_contacted: "Not contacted",
  applied: "Applied",
  in_conversation: "In conversation",
  rejected: "Rejected",
  offer: "Offer",
};

/* Active pipeline first, dead ends last. */
const STATUS_ORDER: Record<NetworkingTarget["status"], number> = {
  offer: 0,
  in_conversation: 1,
  applied: 2,
  not_contacted: 3,
  rejected: 4,
};

type Draft = Omit<NetworkingTarget, "id" | "createdAt" | "updatedAt">;

const EMPTY: Draft = {
  name: "",
  kind: "company",
  status: "not_contacted",
  lastTouched: null,
  notes: "",
  url: "",
  tags: [],
};

function NetworkingDialog({
  open,
  target,
  onOpenChange,
}: {
  open: boolean;
  target: NetworkingTarget | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  useEffect(() => {
    if (open) setDraft(target ? { ...target } : EMPTY);
  }, [open, target]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  function save() {
    if (!draft.name.trim()) return;
    const clean = { ...draft, name: draft.name.trim() };
    if (target) {
      stores.networking.update(target.id, clean);
      logActivity("updated", `Networking target updated: ${clean.name}`);
      toast.success("Target updated");
    } else {
      stores.networking.create(clean);
      logActivity("created", `Networking target added: ${clean.name}`);
      toast.success("Target added");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{target ? "Edit target" : "Add networking target"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="nw-name">Name</Label>
            <Input id="nw-name" value={draft.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Kind</Label>
              <Select value={draft.kind} onValueChange={(v) => set("kind", v as Draft["kind"])}>
                <SelectTrigger aria-label="Kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {networkingKinds.map((k) => (
                    <SelectItem key={k} value={k}>
                      {KIND_LABEL[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => set("status", v as Draft["status"])}>
                <SelectTrigger aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {networkingStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="nw-touched">Last touched</Label>
              <Input
                id="nw-touched"
                type="date"
                value={draft.lastTouched ?? ""}
                onChange={(e) => set("lastTouched", e.target.value || null)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="nw-url">URL</Label>
              <Input id="nw-url" value={draft.url} onChange={(e) => set("url", e.target.value)} inputMode="url" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="nw-notes">Notes</Label>
            <Textarea id="nw-notes" rows={2} value={draft.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{target ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusDot({ status }: { status: NetworkingTarget["status"] }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        status === "offer" && "bg-gold",
        status === "in_conversation" && "bg-foreground",
        status === "applied" && "bg-foreground/40",
        status === "not_contacted" && "border border-muted-foreground/50 bg-transparent",
        status === "rejected" && "bg-risk/50"
      )}
    />
  );
}

export function Networking() {
  const targets = useCollection("networking");
  const [dialog, setDialog] = useState<{ open: boolean; target: NetworkingTarget | null }>({
    open: false,
    target: null,
  });
  const [confirm, setConfirm] = useState<NetworkingTarget | null>(null);
  const [kindFilter, setKindFilter] = useState<"all" | NetworkingTarget["kind"]>("all");
  const [sort, setSort] = useState<"status" | "name" | "touched">("status");

  const visible = targets
    .filter((t) => kindFilter === "all" || t.kind === kindFilter)
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "touched") return (b.lastTouched ?? "").localeCompare(a.lastTouched ?? "");
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name);
    });

  function setStatus(t: NetworkingTarget, status: NetworkingTarget["status"]) {
    stores.networking.update(t.id, { status, lastTouched: todayISO() });
    if (status === "offer") {
      logActivity("completed", `Offer from ${t.name}`);
      toast.success(`Offer from ${t.name} — the plan worked`);
    } else {
      logActivity("updated", `${t.name}: ${STATUS_LABEL[status].toLowerCase()}`);
    }
  }

  function touch(t: NetworkingTarget) {
    stores.networking.update(t.id, { lastTouched: todayISO() });
    logActivity("updated", `Touched ${t.name}`);
    toast.success(`${t.name} marked touched today`);
  }

  const filters: Array<{ key: typeof kindFilter; label: string }> = [
    { key: "all", label: "All" },
    { key: "company", label: "Companies" },
    { key: "job_board", label: "Job boards" },
    { key: "community", label: "Communities" },
  ];

  return (
    <section className="space-y-3" aria-label="Networking targets">
      <SectionHeader
        title="Networking targets"
        count={targets.length}
        action={
          <Button size="xs" variant="outline" onClick={() => setDialog({ open: true, target: null })}>
            <Plus data-icon="inline-start" /> Add target
          </Button>
        }
      />
      <Card>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1" role="group" aria-label="Filter by kind">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setKindFilter(f.key)}
                  aria-pressed={kindFilter === f.key}
                  className={cn(
                    "h-6 rounded-md px-2 text-xs font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring/60",
                    kindFilter === f.key
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger size="sm" className="h-6 w-[132px] text-xs" aria-label="Sort by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Sort: pipeline</SelectItem>
                <SelectItem value="name">Sort: name</SelectItem>
                <SelectItem value="touched">Sort: last touched</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ul>
            <AnimatePresence initial={false}>
              {visible.map((t) => (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={microTransition}
                  className="flex items-center gap-2.5 border-b border-border/60 py-2 first:pt-0 last:border-0 last:pb-0"
                >
                  <StatusDot status={t.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("truncate text-[13px] font-medium", t.status === "rejected" && "text-muted-foreground line-through")}>
                        {t.name}
                      </span>
                      {t.url && (
                        <a
                          href={t.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${t.name}`}
                          className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
                        >
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      )}
                      <span className="text-[10px] tracking-[0.06em] text-muted-foreground/70 uppercase">
                        {KIND_LABEL[t.kind]}
                      </span>
                    </div>
                    {t.notes && (
                      <div className="truncate text-xs text-muted-foreground" title={t.notes}>
                        {t.notes}
                      </div>
                    )}
                  </div>
                  <span className="hidden shrink-0 text-xs text-muted-foreground tabular-nums sm:block">
                    {t.lastTouched ? formatDay(t.lastTouched) : "—"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Mark ${t.name} touched today`}
                    title="Touched today"
                    onClick={() => touch(t)}
                  >
                    <Handshake />
                  </Button>
                  <Select value={t.status} onValueChange={(v) => setStatus(t, v as NetworkingTarget["status"])}>
                    <SelectTrigger size="sm" className="h-6 w-[136px] text-xs" aria-label={`Status for ${t.name}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {networkingStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${t.name}`}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setDialog({ open: true, target: t })}>
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(t)}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {visible.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {targets.length === 0
                ? "No targets yet — add the companies, boards, and communities that matter."
                : "Nothing matches this filter."}
            </p>
          )}
        </CardContent>
      </Card>

      <NetworkingDialog
        open={dialog.open}
        target={dialog.target}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
      {confirm && (
        <ConfirmDelete
          open={!!confirm}
          onOpenChange={(o) => !o && setConfirm(null)}
          what={confirm.name}
          onConfirm={() => {
            stores.networking.remove(confirm.id);
            logActivity("removed", `Networking target removed: ${confirm.name}`);
            toast("Target removed");
            setConfirm(null);
          }}
        />
      )}
    </section>
  );
}
