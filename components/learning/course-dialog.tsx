"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Course, Profile } from "@/lib/schemas";
import { courseStatuses, financialAidStatuses, hiringWeights } from "@/lib/schemas";
import { logActivity, stores } from "@/lib/storage";
import { aidCompletionDeadline, monthISOForIndex, withCourseDerivations } from "@/lib/aid";
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
  targetStartMonth: 1,
  status: "not_started",
  hiringWeight: "medium",
  completedDate: null,
  aidApplicable: true,
  financialAidStatus: "not_applied",
  aidAppliedDate: null,
  aidApprovedDate: null,
  completionDeadline: null,
  tags: [],
};

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(course ? { ...course } : EMPTY);
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
    const finalized = withCourseDerivations({ ...draft, title: draft.title.trim() });
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
          <div className="grid gap-1.5">
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
            <div className="grid gap-1.5">
              <Label htmlFor="course-provider">Provider</Label>
              <Input
                id="course-provider"
                value={draft.provider}
                onChange={(e) => set("provider", e.target.value)}
                placeholder="DeepLearning.AI"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="course-duration">Duration</Label>
              <Input
                id="course-duration"
                value={draft.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="~6 wks"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="course-url">URL</Label>
            <Input
              id="course-url"
              value={draft.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://coursera.org/…"
              inputMode="url"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Start month</Label>
              <Select
                value={String(draft.targetStartMonth)}
                onValueChange={(v) => set("targetStartMonth", Number(v))}
              >
                <SelectTrigger aria-label="Start month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      M{m} · {formatMonth(monthISOForIndex(profile, m))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
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

          <div className="grid gap-1.5">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="course-aid">Coursera Financial Aid applies</Label>
              <Switch
                id="course-aid"
                checked={draft.aidApplicable}
                onCheckedChange={(v) => set("aidApplicable", v)}
              />
            </div>

            {draft.aidApplicable && (
              <>
                <div className="grid gap-1.5">
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
                  <div className="grid gap-1.5">
                    <Label htmlFor="aid-applied">Applied on</Label>
                    <Input
                      id="aid-applied"
                      type="date"
                      value={draft.aidAppliedDate ?? ""}
                      onChange={(e) => set("aidAppliedDate", e.target.value || null)}
                    />
                  </div>
                  <div className="grid gap-1.5">
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
