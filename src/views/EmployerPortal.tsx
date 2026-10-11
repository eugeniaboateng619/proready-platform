import { useMemo, useState } from "react";
import { Trophy, FileCode2, FileText } from "lucide-react";
import { rankedCandidates } from "@/data/candidates";
import type { Candidate } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreMeter } from "@/components/ScoreMeter";
import { ResidencyMatch } from "@/components/ResidencyMatch";
import { IntegrityTimeline } from "@/components/IntegrityTimeline";
import { VivaVocePanel } from "@/components/VivaVocePanel";
import { cn } from "@/lib/utils";

/**
 * View A — Employer / Talent Acquisition Portal Dashboard.
 *
 * Shows the incoming candidate stream ranked strictly by programmatic
 * capability score, plus an interactive evaluation panel per candidate.
 */
export function EmployerPortal() {
  const ranked = useMemo(() => rankedCandidates(), []);
  const [selectedId, setSelectedId] = useState(ranked[0]?.id ?? "");
  const selected =
    ranked.find((c) => c.id === selectedId) ?? ranked[0] ?? null;

  return (
    <div className="container space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Talent Acquisition Portal
        </h1>
        <p className="text-sm text-muted-foreground">
          Incoming candidates ranked strictly by programmatic capability score —
          demonstrated work, not résumés.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section aria-label="Ranked candidate stream" className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Trophy className="size-4 text-primary" />
            Ranked by capability score
          </div>
          <ul className="space-y-3">
            {ranked.map((candidate, index) => (
              <li key={candidate.id}>
                <CandidateRow
                  candidate={candidate}
                  rank={index + 1}
                  active={candidate.id === selected?.id}
                  onSelect={() => setSelectedId(candidate.id)}
                />
              </li>
            ))}
          </ul>

          <ResidencyMatch />
        </section>

        <section aria-label="Evaluation panel">
          {selected ? (
            <EvaluationPanel candidate={selected} />
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No candidates in the stream.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

function CandidateRow({
  candidate,
  rank,
  active,
  onSelect,
}: {
  candidate: Candidate;
  rank: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/50",
        active && "border-primary ring-1 ring-primary",
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {rank}
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {candidate.avatarInitials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {candidate.name}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {candidate.headline}
        </span>
      </span>
      <span className="text-right">
        <span className="block text-base font-semibold tabular-nums">
          {candidate.capabilityScore}
        </span>
        <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
          capability
        </span>
      </span>
    </button>
  );
}

function EvaluationPanel({ candidate }: { candidate: Candidate }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
              {candidate.avatarInitials}
            </span>
            <div>
              <CardTitle>{candidate.name}</CardTitle>
              <CardDescription>{candidate.headline}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary">Well-Architected alignment profile</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-card/50 p-4">
          <div className="mb-3 text-sm font-medium text-foreground">
            Well-Architected alignment radar
          </div>
          <ScoreMeter
            axes={[
              {
                label: "Security Infrastructure Architecture Alignment Index",
                shortLabel: "Security",
                value: candidate.technicalExecutionScore,
              },
              {
                label:
                  "Serverless Resource & Cost-Optimization Alignment Index",
                shortLabel: "Serverless / Cost",
                value: candidate.capabilityScore,
              },
              {
                label: "Operational Execution & Continuity Index",
                shortLabel: "Operations",
                value: candidate.vivaVoceComprehensionScore,
              },
            ]}
          />
        </div>

        <Tabs defaultValue="integrity" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integrity">Integrity Audit</TabsTrigger>
            <TabsTrigger value="viva">Viva Voce</TabsTrigger>
            <TabsTrigger value="submission">Submission</TabsTrigger>
          </TabsList>

          <TabsContent value="integrity" className="pt-4">
            <IntegrityTimeline commits={candidate.commitTimeline} />
          </TabsContent>

          <TabsContent value="viva" className="pt-4">
            <VivaVocePanel
              code={candidate.codeSubmission}
              documentation={candidate.documentation}
              assignmentTitle={candidate.assignmentTitle}
            />
          </TabsContent>

          <TabsContent value="submission" className="space-y-4 pt-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <FileCode2 className="size-4 text-primary" /> Code submission
              </div>
              <pre className="max-h-80 overflow-auto rounded-lg border bg-muted p-4 text-xs leading-relaxed">
                <code>{candidate.codeSubmission}</code>
              </pre>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <FileText className="size-4 text-primary" /> Candidate
                documentation
              </div>
              <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                {candidate.documentation}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
