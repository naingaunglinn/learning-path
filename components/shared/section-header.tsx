export function SectionHeader({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[17px] font-bold tracking-[-0.015em]">
        {title}
        {typeof count === "number" && (
          <span className="ml-1.5 text-meta font-normal text-muted-foreground tabular-nums">
            {count}
          </span>
        )}
      </h2>
      {action}
    </div>
  );
}
