"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Course, Profile } from "@/lib/schemas";
import { courseStatuses, financialAidStatuses, hiringWeights } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { aidCompletionDeadline, monthISOForIndex, withCourseDerivations } from "@/lib/aid";
import { newId } from "@/lib/id";
import { formatDate, formatMonth } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Draft = Omit<Course, "id" | "createdAt" | "updatedAt">;

const EMPTY: Draft = {
  title: "",
  provider: "",
  duration: "",
  url: "",
  targetStartMonth: null,
  plannedStartDate: null,
  durationWeeks: null,
  phase: "",
  modules: [],
  status: "not_started",
  hiringWeight: "medium",
  completedDate: null,
  credentialUrl: "",
  /* Coursera Plus covers the catalog — aid tracking is legacy, off by default. */
  aidApplicable: false,
  financialAidStatus: "not_applied",
  aidAppliedDate: null,
  aidApprovedDate: null,
  completionDeadline: null,
  tags: [],
};

const PHASE_SUGGESTIONS = [
  "Foundations",
  "GenAI engineering",
  "Production & cloud",
  "Interview & landing",
];

const STATUS_LABEL = { not_started: "Not started", in_progress: "In progress", completed: "Completed" };
const AID_LABEL = { not_applied: "Not applied", applied: "Applied (in review)", approved: "Approved", denied: "Denied" };

export function CourseDialog({
  open,
  course,
  profile,
  onOpenChange,
}: {
  open: boolean;
  course: Course | null; // null = create
  profile: Profile;
  onOpenChange: (open: boolean) => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [modulesText, setModulesText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(course ? { ...course } : EMPTY);
      setModulesText((course?.modules ?? []).map((m) => m.title).join("\n"));
      setError(null);
    }
  }, [open, course]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const previewDeadline = aidCompletionDeadline(draft);

  function save() {
    if (!draft.title.trim()) {
      setError("Title is required.");
      return;
    }
    /* One module per line; an unchanged line keeps its check state. */
    const prevModules = [...(course?.modules ?? [])];
    const modules = modulesText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((title) => {
        const i = prevModules.findIndex((m) => m.title === title);
        return i >= 0
          ? prevModules.splice(i, 1)[0]
          : { id: newId(), title, done: false, completedDate: null };
      });
    const finalized = withCourseDerivations({
      ...draft,
      title: draft.title.trim(),
      modules,
      /* A hand-picked start month outranks a stale replanned date. */
      plannedStartDate:
        course && draft.targetStartMonth !== course.targetStartMonth ? null : draft.plannedStartDate,
    });
    try {
      if (course) {
        stores.courses.update(course.id, finalized);
        logActivity("updated", `Course updated: ${finalized.title}`);
        toast.success("Course updated");
      } else {
        stores.courses.create(finalized);
        logActivity("created", `Course added: ${finalized.title}`);
        toast.success("Course added to the roadmap");
      }
      onOpenChange(false);
    } catch {
      setError("Couldn’t save — one of the fields is invalid.");
    }
  }

  const months = Array.from({ length: profile.timelineMonths }, (_, i) => i + 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{course ? "Edit course" : "Add course"}</DialogTitle>
          <DialogDescription>
            {course ? "Changes save to this device immediately." : "Slot it into the 18-month roadmap."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="course-title">Title</Label>
            <Input
              id="course-title"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Generative AI with LLMs"
              aria-invalid={!!error}
            />
            {error && <p className="text-xs text-risk">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="course-provider">Provider</Label>
              <Input
                id="course-provider"
                value={draft.provider}
                onChange={(e) => set("provider", e.target.value)}
                placeholder="DeepLearning.AI"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-duration">Duration (shown on the card)</Label>
              <Input
                id="course-duration"
                value={draft.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="3 courses · ~95 h"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="course-weeks">Plan length (weeks)</Label>
              <Input
                id="course-weeks"
                type="number"
                min={1}
                max={52}
                value={draft.durationWeeks ?? ""}
                onChange={(e) => set("durationWeeks", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="at ~10 h/week"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-phase">Phase</Label>
              <Input
                id="course-phase"
                list="course-phase-options"
                value={draft.phase}
                onChange={(e) => set("phase", e.target.value)}
                placeholder="Foundations"
              />
              <datalist id="course-phase-options">
                {PHASE_SUGGESTIONS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course-url">URL</Label>
            <Input
              id="course-url"
              value={draft.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://coursera.org/…"
              inputMode="url"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course-credential">Certificate URL — paste the verify link once earned</Label>
            <Input
              id="course-credential"
              value={draft.credentialUrl}
              onChange={(e) => set("credentialUrl", e.target.value)}
              placeholder="https://coursera.org/verify/…"
              inputMode="url"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course-modules">Syllabus checklist — one module per line</Label>
            <Textarea
              id="course-modules"
              value={modulesText}
              onChange={(e) => setModulesText(e.target.value)}
              placeholder={"Week 1 · …\nWeek 2 · …"}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Checking the last module on the card completes the course. Renaming a line resets its
              check.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Start month</Label>
              <Select
                value={draft.targetStartMonth === null ? "none" : String(draft.targetStartMonth)}
                onValueChange={(v) => set("targetStartMonth", v === "none" ? null : Number(v))}
              >
                <SelectTrigger aria-label="Start month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unscheduled</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      M{m} · {formatMonth(monthISOForIndex(profile, m))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Hiring weight</Label>
              <Select
                value={draft.hiringWeight}
                onValueChange={(v) => set("hiringWeight", v as Draft["hiringWeight"])}
              >
                <SelectTrigger aria-label="Hiring weight">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hiringWeights.map((w) => (
                    <SelectItem key={w} value={w} className="capitalize">
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={draft.status} onValueChange={(v) => set("status", v as Draft["status"])}>
              <SelectTrigger aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courseStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 border-t pt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="course-aid">Track Financial Aid</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Off by default — Coursera Plus covers the catalog.
                </p>
              </div>
              <Switch
                id="course-aid"
                checked={draft.aidApplicable}
                onCheckedChange={(v) => set("aidApplicable", v)}
              />
            </div>

            {draft.aidApplicable && (
              <>
                <div className="grid gap-2">
                  <Label>Aid status</Label>
                  <Select
                    value={draft.financialAidStatus}
                    onValueChange={(v) => set("financialAidStatus", v as Draft["financialAidStatus"])}
                  >
                    <SelectTrigger aria-label="Aid status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {financialAidStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {AID_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="aid-applied">Applied on</Label>
                    <Input
                      id="aid-applied"
                      type="date"
                      value={draft.aidAppliedDate ?? ""}
                      onChange={(e) => set("aidAppliedDate", e.target.value || null)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="aid-approved">Approved on</Label>
                    <Input
                      id="aid-approved"
                      type="date"
                      value={draft.aidApprovedDate ?? ""}
                      onChange={(e) => set("aidApprovedDate", e.target.value || null)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {previewDeadline
                    ? `Completion deadline (auto): ${formatDate(previewDeadline)} — approval + 180 days.`
                    : "Completion deadline is computed automatically: approval date + 180 days."}
                </p>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{course ? "Save changes" : "Add course"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
