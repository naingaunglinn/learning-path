"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ClipboardCopy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fadeUp, staggerParent } from "@/lib/motion";
import type { Achievement, StarStory } from "@/lib/schemas";
import { competencies } from "@/lib/schemas";
import { useCollection } from "@/lib/use-collection";
import { COMPETENCY_LABEL } from "@/components/portfolio/stories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Format = "evidence" | "number_first" | "star_blocks";

const FORMAT_LABEL: Record<Format, string> = {
  evidence: "Bullets — evidence first",
  number_first: "Bullets — number first",
  star_blocks: "STAR blocks (cover letter)",
};

function firstSentence(s: string): string {
  const trimmed = s.trim();
  const idx = trimmed.indexOf(". ");
  return idx === -1 ? trimmed.replace(/\.$/, "") : trimmed.slice(0, idx);
}

function compose(
  achievements: Achievement[],
  stories: StarStory[],
  format: Format
): string {
  const lines: string[] = [];
  if (format === "star_blocks") {
    for (const a of achievements) {
      lines.push(`• ${a.context} (${a.value})`);
    }
    if (achievements.length && stories.length) lines.push("");
    for (const s of stories) {
      lines.push(
        `${s.title} [${s.competencyTags.map((c) => COMPETENCY_LABEL[c]).join(", ")}]`,
        `  Situation: ${s.situation}`,
        `  Task: ${s.task}`,
        `  Action: ${s.action}`,
        `  Result: ${s.result}`,
        ""
      );
    }
    return lines.join("\n").trimEnd();
  }
  for (const a of achievements) {
    lines.push(format === "number_first" ? `• ${a.value} — ${a.context}` : `• ${a.context} (${a.value})`);
  }
  for (const s of stories) {
    lines.push(`• ${firstSentence(s.action)} — ${firstSentence(s.result).toLowerCase()}`);
  }
  return lines.join("\n");
}

export function BulletsView() {
  const achievements = useCollection("achievements");
  const stories = useCollection("stories");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<Format>("evidence");
  const [text, setText] = useState("");
  const [dirty, setDirty] = useState(false);
  const [filter, setFilter] = useState<"all" | (typeof competencies)[number]>("all");

  const pickedAchievements = achievements.filter((a) => selected.has(a.id));
  const pickedStories = stories.filter((s) => selected.has(s.id));
  const generated = useMemo(
    () => compose(pickedAchievements, pickedStories, format),
    [pickedAchievements, pickedStories, format]
  );

  /* Regenerate into the editor unless the user has hand-edited. */
  useEffect(() => {
    if (!dirty) setText(generated);
  }, [generated, dirty]);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copy() {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      const n = text.split("\n").filter((l) => l.trim().startsWith("•")).length;
      toast.success(n > 0 ? `Copied ${n} bullet${n > 1 ? "s" : ""} to clipboard` : "Copied to clipboard");
    } catch {
      toast.error("Clipboard unavailable — select the text and copy manually.");
    }
  }

  const visibleStories = filter === "all" ? stories : stories.filter((s) => s.competencyTags.includes(filter));
  const count = selected.size;

  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="grid items-start gap-4 lg:grid-cols-2">
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle>Evidence picker</CardTitle>
            <CardDescription>Select achievements and stories to mine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1.5 text-label text-muted-foreground uppercase">
                Quantified achievements
              </div>
              <div className="space-y-1">
                {achievements.map((a) => (
                  <label
                    key={a.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-1.5 text-[13px] transition-colors duration-200",
                      selected.has(a.id) ? "border-foreground/40 bg-secondary/60" : "hover:bg-muted/60"
                    )}
                  >
                    <Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggle(a.id)} aria-label={a.context} />
                    <span className="font-semibold tabular-nums">{a.value}</span>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">{a.context}</span>
                  </label>
                ))}
                {achievements.length === 0 && (
                  <p className="text-sm text-muted-foreground">No achievements logged yet — add them in Portfolio.</p>
                )}
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-label text-muted-foreground uppercase">
                  STAR stories
                </span>
                <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                  <SelectTrigger size="sm" className="h-7 w-[172px] text-chip" aria-label="Filter stories by competency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All competencies</SelectItem>
                    {competencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {COMPETENCY_LABEL[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                {visibleStories.map((s) => (
                  <label
                    key={s.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-1.5 text-[13px] transition-colors duration-200",
                      selected.has(s.id) ? "border-foreground/40 bg-secondary/60" : "hover:bg-muted/60"
                    )}
                  >
                    <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} aria-label={s.title} />
                    <span className="min-w-0 flex-1 truncate">{s.title}</span>
                    <span className="hidden shrink-0 gap-1 sm:flex">
                      {s.competencyTags.slice(0, 2).map((c) => (
                        <span key={c} className="inline-flex h-5 items-center rounded-full bg-foreground px-2 text-[10px] font-medium text-background">
                          {COMPETENCY_LABEL[c]}
                        </span>
                      ))}
                    </span>
                  </label>
                ))}
                {visibleStories.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {stories.length === 0 ? "No stories banked yet — add them in Portfolio." : "None match this competency."}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="lg:sticky lg:top-[72px]">
        <Card>
          <CardHeader>
            <CardTitle>Composed bullets</CardTitle>
            <CardDescription>
              {count === 0
                ? "Pick achievements on the left. They compose into resume bullets here."
                : `${count} item${count > 1 ? "s" : ""} selected`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Select
                value={format}
                onValueChange={(v) => {
                  setFormat(v as Format);
                  setDirty(false);
                }}
              >
                <SelectTrigger size="sm" className="h-7 w-[220px] text-chip" aria-label="Bullet format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FORMAT_LABEL) as Format[]).map((f) => (
                    <SelectItem key={f} value={f}>
                      {FORMAT_LABEL[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dirty && (
                <Button variant="ghost" size="xs" onClick={() => setDirty(false)} title="Discard edits and regenerate">
                  <RotateCcw data-icon="inline-start" /> Regenerate
                </Button>
              )}
            </div>
            <Textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setDirty(true);
              }}
              rows={14}
              placeholder={"Pick achievements on the left.\nThey compose into resume bullets here — edit freely before copying."}
              className="font-mono text-[12.5px] leading-relaxed"
              aria-label="Composed bullets"
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {dirty ? "Hand-edited — selection changes won’t overwrite." : "Regenerates as you change the selection."}
              </p>
              <Button onClick={copy} disabled={!text.trim()}>
                <ClipboardCopy data-icon="inline-start" /> Copy to clipboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
