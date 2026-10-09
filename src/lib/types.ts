/**
 * Shared domain types for the ProReady prototype.
 *
 * These types describe the shape of data as it would flow between the
 * (currently mocked) backend services and the React views. Keeping them in a
 * single module makes the real-integration swap-out points obvious.
 */

/** A single commit in a candidate's submission timeline. */
export interface CommitEvent {
  /** Short SHA-style identifier (mocked). */
  hash: string;
  /** ISO timestamp of the commit. */
  timestamp: string;
  /** Commit message. */
  message: string;
  /** Lines of code added in this commit. */
  additions: number;
  /** Lines of code removed in this commit. */
  deletions: number;
}

/** Advisory classification produced by the Git-Commit Timeline Audit Engine. */
export type IntegrityClassification =
  | "natural-incremental"
  | "bulk-injection-advisory";

/**
 * Result of the Git-Commit Timeline Audit Engine.
 *
 * NOTE: This is explicitly an ADVISORY signal. It recommends human review and
 * must never be used as an automatic pass/fail disqualifier.
 */
export interface IntegrityAuditResult {
  classification: IntegrityClassification;
  /**
   * 0-100 authenticity confidence. Higher = more consistent with natural,
   * incremental development. Advisory only.
   */
  authenticityScore: number;
  /** The single largest single-commit injection as a share of total additions. */
  largestInjectionRatio: number;
  /** Peak commit velocity observed (lines added per minute). */
  peakVelocityLinesPerMinute: number;
  /** Human-readable advisory summary surfaced in the UI. */
  advisory: string;
  /** Whether a human reviewer should take a closer look. */
  recommendsHumanReview: boolean;
  /** Per-commit annotations used to render the timeline. */
  annotatedCommits: AnnotatedCommit[];
}

export interface AnnotatedCommit extends CommitEvent {
  /** Lines added per minute since the previous commit. */
  velocityLinesPerMinute: number;
  /** Flagged as a potential bulk injection point (advisory). */
  flagged: boolean;
}

/** A generated Viva Voce question from the (mocked) Bedrock explainer agent. */
export interface VivaQuestion {
  id: string;
  prompt: string;
  /** The engineering theme this question probes. */
  focusArea: "architecture" | "security" | "trade-offs";
}

/** A candidate's recorded answer to a Viva Voce question. */
export interface VivaAnswer {
  questionId: string;
  answer: string;
  /** Seconds remaining on the 90s timer when submitted. */
  secondsRemaining: number;
  /** True when the countdown expired before an answer was submitted. */
  timedOut: boolean;
}

export interface VivaVoceResult {
  comprehensionScore: number;
  answers: VivaAnswer[];
  summary: string;
}

/** A candidate in the employer's ranked stream. */
export interface Candidate {
  id: string;
  name: string;
  headline: string;
  avatarInitials: string;
  /** Programmatic capability score (0-100) used for ranking. */
  capabilityScore: number;
  technicalExecutionScore: number;
  vivaVoceComprehensionScore: number;
  /** The assignment the candidate completed. */
  assignmentTitle: string;
  /** Seeded commit timeline for the integrity engine. */
  commitTimeline: CommitEvent[];
  /** Mocked code snapshot used to seed the Viva Voce questions. */
  codeSubmission: string;
  /** Mocked documentation the candidate wrote. */
  documentation: string;
}

/** A real-world project brief shown in the candidate workspace. */
export interface ProjectBrief {
  id: string;
  title: string;
  company: string;
  scenario: string;
  objectives: string[];
  deliverables: string[];
  constraints: string[];
  estimatedHours: number;
}
