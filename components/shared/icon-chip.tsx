import { cn } from "@/lib/utils";

/** 28px rounded-square icon container — solid ink, like the chips. */
export function IconChip({
  tone = "neutral",
  className,
  children,
}: {
  tone?: "neutral" | "win" | "risk";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md [&_svg]:size-3.5",
        tone === "neutral" && "bg-foreground text-background",
        tone === "win" && "bg-green text-foreground",
        tone === "risk" && "bg-risk text-white",
        className
      )}
    >
      {children}
    </span>
  );
}
