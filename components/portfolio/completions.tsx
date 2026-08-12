"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Award, GraduationCap, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Certification } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { useCollection } from "@/lib/use-collection";
import { formatDate } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { SectionHeader } from "@/components/shared/section-header";

type Draft = Omit<Certification, "id" | "createdAt" | "updatedAt">;
const EMPTY: Draft = { title: "", issuer: "", date: null, credentialUrl: "", tags: [] };

/* Learning completions = external certs (this collection) ∪ completed courses
   (read live from the courses store by id — never duplicated into records). */
export function Completions() {
  const certifications = useCollection("certifications");
  const courses = useCollection("courses");
  const completedCourses = courses.filter((c) => c.status === "completed");

  const [dialog, setDialog] = useState<{ open: boolean; cert: Certification | null }>({ open: false, cert: null });
  const [confirm, setConfirm] = useState<Certification | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (dialog.open) setDraft(dialog.cert ? { ...dialog.cert } : EMPTY);
  }, [dialog]);

  const total = certifications.length + completedCourses.length;

  function save() {
    if (!draft.title.trim()) return;
    const clean = { ...draft, title: draft.title.trim() };
    if (dialog.cert) {
      stores.certifications.update(dialog.cert.id, clean);
      toast.success("Credential updated");
    } else {
      stores.certifications.create(clean);
      logActivity("completed", `Credential logged: ${clean.title}`);
      toast.success("Credential logged");
    }
    setDialog({ open: false, cert: null });
  }

  return (
    <section className="space-y-3" aria-label="Learning completions">
      <SectionHeader
        title="Learning completions"
        count={total}
        action={
          <Button size="xs" variant="outline" onClick={() => setDialog({ open: true, cert: null })}>
            <Plus data-icon="inline-start" /> Add external cert
          </Button>
        }
      />
      <Card>
        <CardContent>
          {total === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing completed yet. Finish a course in{" "}
              <Link href="/learning" className="underline underline-offset-2 hover:text-foreground">
                Learning
              </Link>{" "}
              and it lands here automatically — or add an external credential.
            </p>
          ) : (
            <ul>
              {completedCourses.map((c) => (
                <li key={c.id} className="flex items-center gap-2.5 border-b border-border/60 py-2.5 first:pt-0 last:border-0 last:pb-0">
                  <GraduationCap className="size-4 shrink-0 text-gold-ink" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-medium">{c.title}</span>
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${c.title}`}
                          className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
                        >
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.provider}
                      {c.completedDate && ` · ${formatDate(c.completedDate)}`}
                    </div>
                  </div>
                  <Chip tone="gold" title="Lives in the Learning roadmap — edit it there">
                    <Link href="/learning" className="outline-none">
                      from roadmap
                    </Link>
                  </Chip>
                </li>
              ))}
              {certifications.map((cert) => (
                <li key={cert.id} className="flex items-center gap-2.5 border-b border-border/60 py-2.5 first:pt-0 last:border-0 last:pb-0">
                  <Award className="size-4 shrink-0 text-gold-ink" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-medium">{cert.title}</span>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open credential for ${cert.title}`}
                          className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
                        >
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {cert.issuer}
                      {cert.date && ` · ${formatDate(cert.date)}`}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${cert.title}`}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setDialog({ open: true, cert })}>
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(cert)}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialog.open} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog.cert ? "Edit credential" : "Add external credential"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="ct-title">Title</Label>
              <Input id="ct-title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="ct-issuer">Issuer</Label>
                <Input id="ct-issuer" value={draft.issuer} onChange={(e) => setDraft((d) => ({ ...d, issuer: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ct-date">Date</Label>
                <Input
                  id="ct-date"
                  type="date"
                  value={draft.date ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value || null }))}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ct-url">Credential URL</Label>
              <Input id="ct-url" value={draft.credentialUrl} onChange={(e) => setDraft((d) => ({ ...d, credentialUrl: e.target.value }))} inputMode="url" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog({ open: false, cert: null })}>
              Cancel
            </Button>
            <Button onClick={save}>{dialog.cert ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {confirm && (
        <ConfirmDelete
          open={!!confirm}
          onOpenChange={(o) => !o && setConfirm(null)}
          what={confirm.title}
          onConfirm={() => {
            stores.certifications.remove(confirm.id);
            toast("Credential removed");
            setConfirm(null);
          }}
        />
      )}
    </section>
  );
}
