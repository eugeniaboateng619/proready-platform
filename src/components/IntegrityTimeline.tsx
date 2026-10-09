import { ShieldAlert, ShieldCheck, GitCommitHorizontal, Info } from "lucide-react";
import type { CommitEvent } from "@/lib/types";
import { analyzeCommitTimeline } from "@/lib/integrityEngine";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface IntegrityTimelineProps {
  commits: CommitEvent[];
}

/**
 * Renders the output of the Git-Commit Timeline Audit Engine (Feature 1).
 *
 * Everything here frames the result as an ADVISORY signal recommending human
 * review — never an automatic pass/fail.
 */
export function IntegrityTimeline({ commits }: IntegrityTimelineProps) {
  const result = analyzeCommitTimeline(commits);
  const flagged = result.classification === "bulk-injection-advisory";

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border p-4",
          flagged
            ? "border-warning/40 bg-warning/10"
            : "border-success/40 bg-success/10",
        )}
      >
        {flagged ? (
          <ShieldAlert className="mt-0.5 size-5 text-warning" />
        ) : (
          <ShieldCheck className="mt-0.5 size-5 text-success" />
        )}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">
              {flagged
                ? "Possible bulk code injection"
                : "Natural incremental development"}
            </span>
            <Badge variant={flagged ? "warning" : "success"}>
              Authenticity {result.authenticityScore}/100
            </Badge>
            <Badge variant="outline">Advisory signal</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{result.advisory}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
        <Info className="size-3.5 shrink-0" />
        <span>
          This Integrity / Code Authenticity metric is an{" "}
          <strong className="font-semibold text-foreground">
            advisory signal intended for human review
          </strong>
          . It must never be used as an automatic pass/fail disqualifier.
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Commits analysed" value={String(commits.length)} />
        <Stat
          label="Peak velocity"
          value={`${result.peakVelocityLinesPerMinute} LOC/min`}
        />
        <Stat
          label="Largest single commit"
          value={`${Math.round(result.largestInjectionRatio * 100)}% of code`}
        />
      </dl>

      <ol className="relative space-y-3 border-l border-border pl-6">
        {result.annotatedCommits.map((commit) => (
          <li key={commit.hash} className="relative">
            <span
              className={cn(
                "absolute -left-[1.6rem] flex size-5 items-center justify-center rounded-full border bg-card",
                commit.flagged ? "border-warning" : "border-border",
              )}
            >
              <GitCommitHorizontal
                className={cn(
                  "size-3",
                  commit.flagged ? "text-warning" : "text-muted-foreground",
                )}
              />
            </span>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <code className="text-xs font-medium text-foreground">
                {commit.hash}
              </code>
              <span className="text-xs text-muted-foreground">
                +{commit.additions} / -{commit.deletions} ·{" "}
                {commit.velocityLinesPerMinute} LOC/min
              </span>
            </div>
            <p className="text-sm text-foreground">{commit.message}</p>
            {commit.flagged ? (
              <span className="text-xs font-medium text-warning">
                Flagged for human review (high-velocity bulk addition)
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}
