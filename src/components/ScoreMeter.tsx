import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ScoreMeterProps {
  label: string;
  value: number;
  /** Optional helper caption under the label. */
  caption?: string;
  className?: string;
}

/** Pick an indicator color band from a 0-100 score. */
function bandClass(value: number): string {
  if (value >= 80) return "bg-success";
  if (value >= 60) return "bg-primary";
  if (value >= 40) return "bg-warning";
  return "bg-destructive";
}

/** A labelled 0-100 score meter used across the evaluation panels. */
export function ScoreMeter({
  label,
  value,
  caption,
  className,
}: ScoreMeterProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {value}
          <span className="text-muted-foreground">/100</span>
        </span>
      </div>
      <Progress value={value} indicatorClassName={bandClass(value)} />
      {caption ? (
        <p className="text-xs text-muted-foreground">{caption}</p>
      ) : null}
    </div>
  );
}
