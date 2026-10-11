import { useCallback, useMemo, useRef, useState } from "react";
import {
  UploadCloud,
  File as FileIcon,
  X,
  Check,
  Copy,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UploadedResume {
  name: string;
  size: number;
}

/**
 * Maps a non-technical background history to a foundational engineering trait.
 *
 * These are the client-side parsing stubs: a real build would extract these
 * phrases from the resume PDF text. For the prototype they are a fixed
 * translation table surfaced so candidates understand how their lived
 * experience reads as engineering capability.
 */
interface TraitMapping {
  /** Phrase as it appears in a non-technical resume. */
  from: string;
  /** Foundational engineering trait it maps to. */
  to: string;
}

const TRAIT_MAPPINGS: TraitMapping[] = [
  { from: "Policy Analysis", to: "Systemic Logic" },
  { from: "Risk Assessment", to: "Vulnerability Containment" },
];

/** Build the candidate's unique ProReady portfolio share-link. */
function portfolioShareLink(resumeName: string | null): string {
  const slug = (resumeName ?? "candidate")
    .replace(/\.pdf$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "candidate";
  return `https://proready.dev/portfolio/${slug}`;
}

/**
 * Client text-parsing stub.
 *
 * In the real build this would read the extracted PDF text and detect which
 * `from` phrases are present. For the prototype we assume both foundational
 * backgrounds are present once a resume is attached, so candidates can see the
 * full translation. The seam for real parsing is this function.
 */
function detectTraits(_resumeText: string): TraitMapping[] {
  // TODO(parsing): extract text from the PDF and return only matched traits.
  return TRAIT_MAPPINGS;
}

/** Produce copy-and-paste markdown resume bullet points for the ATS optimizer. */
function buildAtsBullets(
  traits: TraitMapping[],
  shareLink: string,
): string {
  const traitLines = traits.map(
    (t) =>
      `- Reframed **${t.from}** experience into **${t.to}**, a core engineering competency validated through project-based residency work.`,
  );
  return [
    ...traitLines,
    `- Shipped a verifiable, project-based engineering portfolio — full evidence profile at [${shareLink}](${shareLink}).`,
  ].join("\n");
}

/**
 * Browser-native drag-and-drop upload zone for a single PDF resume.
 *
 * NOTE: This is a frontend-only prototype. The file is listed in local state
 * and never leaves the browser — there is no backend upload or real PDF text
 * extraction. The seams for a real build are `detectTraits` (parsing) and the
 * `onResumeAccepted` TODO below (upload).
 */
export function UploadZone() {
  const [resume, setResume] = useState<UploadedResume | null>(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptResume = useCallback((list: FileList | null) => {
    if (!list || list.length === 0) return;
    const file = Array.from(list).find((f) =>
      /\.pdf$/i.test(f.name) || f.type === "application/pdf",
    );
    if (!file) return; // accept a single PDF resume only
    // TODO(backend): forward `file` to a real upload + PDF text extractor here.
    setResume({ name: file.name, size: file.size });
    setCopied(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      acceptResume(e.dataTransfer.files);
    },
    [acceptResume],
  );

  const traits = useMemo(
    () => (resume ? detectTraits("") : []),
    [resume],
  );
  const shareLink = useMemo(
    () => portfolioShareLink(resume?.name ?? null),
    [resume],
  );
  const atsBullets = useMemo(
    () => buildAtsBullets(traits, shareLink),
    [traits, shareLink],
  );

  const copyBullets = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(atsBullets);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [atsBullets]);

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
        )}
      >
        <UploadCloud className="size-8 text-primary" />
        <p className="text-sm font-medium">
          Drag & drop a single PDF resume
        </p>
        <p className="text-xs text-muted-foreground">
          or click to browse — only a .pdf resume is accepted, and nothing
          leaves your browser in this prototype
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => acceptResume(e.target.files)}
        />
      </div>

      {resume ? (
        <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <FileIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{resume.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {(resume.size / 1024).toFixed(1)} KB
            </span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={`Remove ${resume.name}`}
            onClick={() => {
              setResume(null);
              setCopied(false);
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : null}

      {resume ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" /> Resume Trait
                Diagnostics
              </CardTitle>
              <CardDescription>
                Your non-technical background history, mapped to foundational
                engineering traits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {traits.map((t) => (
                  <li
                    key={t.from}
                    className="flex flex-wrap items-center gap-2 text-sm"
                  >
                    <Badge variant="outline">{t.from}</Badge>
                    <ArrowRight className="size-4 text-muted-foreground" />
                    <Badge variant="secondary">{t.to}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">
                    ATS Keyword Optimizer
                  </CardTitle>
                  <CardDescription>
                    Copy-and-paste markdown resume bullet points, including your
                    unique ProReady portfolio share-link.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyBullets}
                  aria-label="Copy optimized resume bullet points"
                >
                  {copied ? (
                    <>
                      <Check className="size-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" /> Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <pre className="max-h-56 overflow-auto rounded-lg border bg-muted p-4 text-xs leading-relaxed">
                <code>{atsBullets}</code>
              </pre>
              <p className="text-xs text-muted-foreground">
                Portfolio share-link:{" "}
                <a
                  href={shareLink}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  {shareLink}
                </a>
              </p>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
