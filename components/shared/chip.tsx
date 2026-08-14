import { cn } from "@/lib/utils";

/* Solid pill chips — no pale tints, no alpha fills.
   neutral/solid — near-black, white text: the default for any status or count
   win          — vivid green, ink text: done, shipped, approved, "now"
   risk         — solid red, white text: genuine urgency only (overdue, ≤30d)
   ghost        — bare subtle text: timestamps and metadata */

export type ChipTone = "solid" | "risk" | "win" | "neutral" | "ghost";

export function Chip({
  tone = "neutral",
  title,
  className,
  children,
}: {
  tone?: ChipTone;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-3 text-chip whitespace-nowrap tabular-nums",
        tone === "ghost" && "px-1 text-subtle",
        tone === "risk" && "bg-risk text-white",
        tone === "win" && "bg-green font-medium text-foreground",
        (tone === "neutral" || tone === "solid") && "bg-foreground text-background",
        className
      )}
    >
      {children}
    </span>
  );
}
