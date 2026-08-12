import { cn } from "@/lib/utils";

export function Chip({
  tone = "muted",
  title,
  className,
  children,
}: {
  tone?: "muted" | "risk" | "gold";
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-md border px-1.5 text-[11px] font-medium whitespace-nowrap tabular-nums",
        tone === "muted" && "bg-background text-muted-foreground",
        tone === "risk" && "border-risk/25 bg-risk-soft text-risk",
        tone === "gold" && "border-gold/40 bg-gold-soft text-gold-ink",
        className
      )}
    >
      {children}
    </span>
  );
}
