import { useState } from "react";
import { Clock, Target, Package, AlertTriangle, FileText } from "lucide-react";
import { securityIncidentBrief } from "@/data/projectBrief";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/UploadZone";
import { VivaVocePanel } from "@/components/VivaVocePanel";

/**
 * View B — Candidate / Emerging Talent Workspace.
 *
 * Shows the active real-world project brief (fictional Company Security
 * Incident Scenario), a browser-native upload zone, and a documentation
 * workspace. Submitting triggers the mocked Viva Voce explainer agent.
 */
export function CandidateWorkspace() {
  const brief = securityIncidentBrief;
  const [docs, setDocs] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="container space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Your active assignment
        </h1>
        <p className="text-sm text-muted-foreground">
          Build a functional evidence profile by shipping real work. Commit
          incrementally — your timeline is part of the evidence.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle>{brief.title}</CardTitle>
                  <CardDescription>{brief.company}</CardDescription>
                </div>
                <Badge variant="secondary">
                  <Clock className="mr-1 size-3" />~{brief.estimatedHours}h
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-destructive">
                  <AlertTriangle className="size-4" /> Security Incident
                  Scenario
                </div>
                <p className="text-sm text-foreground">{brief.scenario}</p>
              </div>

              <BriefList
                icon={<Target className="size-4 text-primary" />}
                title="Objectives"
                items={brief.objectives}
              />
              <BriefList
                icon={<Package className="size-4 text-primary" />}
                title="Deliverables"
                items={brief.deliverables}
              />
              <BriefList
                icon={<AlertTriangle className="size-4 text-primary" />}
                title="Constraints"
                items={brief.constraints}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4 text-primary" /> Documentation
                workspace
              </CardTitle>
              <CardDescription>
                Explain your trust boundaries, failure modes, and the trade-offs
                you made. This feeds the Viva Voce questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={docs}
                onChange={(e) => setDocs(e.target.value)}
                placeholder="# DESIGN.md\n\nI chose short-lived HMAC tokens because…"
                className="min-h-[200px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submit your deliverable</CardTitle>
              <CardDescription>
                Upload your code and configuration files.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <UploadZone />
              <Button className="w-full" onClick={() => setSubmitted(true)}>
                Submit for evaluation
              </Button>
              <p className="text-xs text-muted-foreground">
                Submitting invokes the AI Viva Voce explainer agent, which will
                ask you to defend your engineering choices under a timed window.
              </p>
            </CardContent>
          </Card>

          {submitted ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Viva Voce defense</CardTitle>
                <CardDescription>
                  Answer each generated question within the countdown.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VivaVocePanel
                  code={docs || SAMPLE_SUBMISSION}
                  documentation={docs}
                  assignmentTitle={brief.title}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BriefList({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm text-muted-foreground"
          >
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Fallback code used to seed Viva Voce questions if the candidate wrote no docs. */
const SAMPLE_SUBMISSION = `function issue(scope) {
  // short-lived HMAC token with scope + expiry
}
function verify(token) { /* validate signature + expiry + revocation */ }
function revoke(jti) { /* add to denylist */ }`;
