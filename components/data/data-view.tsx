"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { fadeUp, staggerParent } from "@/lib/motion";
import type { Profile } from "@/lib/schemas";
import { importAll, logActivity, profileStore, resetToSeed } from "@/lib/storage";
import { useProfile } from "@/lib/use-collection";
import { downloadBackup } from "@/lib/export-file";
import { joinList, parseList } from "@/lib/text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function ProfileCard() {
  const profile = useProfile();
  const [draft, setDraft] = useState<Profile | null>(null);
  const current = draft ?? profile;
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setDraft({ ...current, [k]: v });

  function save() {
    if (!draft) return;
    try {
      profileStore.set(draft);
      logActivity("updated", "Profile updated");
      toast.success("Profile saved");
      setDraft(null);
    } catch {
      toast.error("Couldn’t save — check the date fields.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Drives the timeline, countdown chip, and KPIs</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="pf-name">Name</Label>
            <Input id="pf-name" value={current.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pf-role">Role</Label>
            <Input id="pf-role" value={current.role} onChange={(e) => set("role", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pf-company">Company</Label>
            <Input id="pf-company" value={current.company} onChange={(e) => set("company", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pf-location">Location</Label>
            <Input id="pf-location" value={current.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pf-target-date">Target date</Label>
            <Input
              id="pf-target-date"
              type="date"
              value={current.targetDate}
              onChange={(e) => set("targetDate", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pf-target-label">Target label</Label>
            <Input id="pf-target-label" value={current.targetLabel} onChange={(e) => set("targetLabel", e.target.value)} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pf-stack">Stack (comma-separated)</Label>
          <Textarea id="pf-stack" rows={2} value={joinList(current.stack)} onChange={(e) => set("stack", parseList(e.target.value))} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pf-roles">Target roles (comma-separated, ranked)</Label>
          <Textarea id="pf-roles" rows={2} value={joinList(current.targetRoles)} onChange={(e) => set("targetRoles", parseList(e.target.value))} />
        </div>
        <div className="flex justify-end gap-2">
          {draft && (
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Discard
            </Button>
          )}
          <Button onClick={save} disabled={!draft}>
            Save profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DataView() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  function handleExport() {
    downloadBackup();
    toast.success("Backup downloaded");
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        const result = importAll(json);
        if (result.ok) {
          const total = Object.values(result.counts).reduce((a, b) => a + b, 0);
          setImportSummary(`Imported ${total} records across ${Object.keys(result.counts).length} collections.`);
          toast.success("Import complete", { description: "The workspace now matches the backup." });
        } else {
          setImportSummary(null);
          toast.error("Import rejected", { description: result.error });
        }
      } catch {
        toast.error("Not valid JSON", { description: "The file couldn’t be parsed." });
      }
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsText(file);
  }

  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Export</CardTitle>
              <CardDescription>Everything — plan, portfolio, profile — as one JSON file</CardDescription>
            </CardHeader>
            <CardContent className="flex h-full flex-col items-start gap-3">
              <p className="text-sm text-muted-foreground">
                localStorage is the only copy of this data. Export weekly so a cleared cache never
                costs the plan.
              </p>
              <Button onClick={handleExport}>
                <Download data-icon="inline-start" /> Download backup
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Import</CardTitle>
              <CardDescription>Restore from a backup — validated before anything is written</CardDescription>
            </CardHeader>
            <CardContent className="flex h-full flex-col items-start gap-3">
              <p className="text-sm text-muted-foreground">
                The file is checked against the schema first; a bad file changes nothing. A good
                file replaces the whole workspace.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                aria-label="Choose backup file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImportFile(f);
                }}
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload data-icon="inline-start" /> Choose backup file
              </Button>
              {importSummary && <p className="text-xs text-muted-foreground">{importSummary}</p>}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={fadeUp}>
        <ProfileCard />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="border-risk/25">
          <CardHeader>
            <CardTitle className="text-risk">Danger zone</CardTitle>
            <CardDescription>Wipe everything and restore the original seed data</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <RotateCcw data-icon="inline-start" /> Reset to seed
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Wipe workspace and restore seed data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Everything you’ve logged is deleted. Export a backup first if you want to keep
                    it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my data</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-risk text-white hover:bg-risk/90"
                    onClick={() => {
                      resetToSeed();
                      toast.success("Workspace wiped — seed data restored");
                    }}
                  >
                    Wipe and reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
