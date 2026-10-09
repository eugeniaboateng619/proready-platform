/**
 * Feature 1 — Git-Commit Timeline Audit Engine (MOCKED, pure functions).
 *
 * This module analyses a candidate's commit timeline and classifies the work
 * pattern as either "natural, incremental development" or a possible
 * "immediate bulk code injection" (a proxy/copy-paste signal).
 *
 * ---------------------------------------------------------------------------
 * DESIGN REQUIREMENT — ADVISORY ONLY
 * ---------------------------------------------------------------------------
 * The output of this engine is an ADVISORY integrity signal. It is designed to
 * RECOMMEND HUMAN REVIEW. It must NEVER be wired up as an automatic pass/fail
 * disqualifier. The UI copy reflects this framing everywhere the signal is
 * surfaced.
 *
 * There is no network or AWS dependency here; this is deterministic logic over
 * seeded data. Real integration would replace the seeded `CommitEvent[]` input
 * with the output of a real `git log` parser (see README "Mocked seams").
 */

import type {
  AnnotatedCommit,
  CommitEvent,
  IntegrityAuditResult,
} from "./types";

/** Tunable thresholds for the advisory classifier. */
export const INTEGRITY_THRESHOLDS = {
  /**
   * If any single commit accounts for more than this share of total additions,
   * it is treated as a potential bulk-injection point.
   */
  bulkInjectionRatio: 0.6,
  /**
   * Commit velocity (lines added per minute) above which a commit is flagged
   * as suspiciously fast for hand-written, understood code.
   */
  velocityLinesPerMinute: 400,
  /** A single commit adding more than this many lines is inherently notable. */
  largeSingleCommitAdditions: 300,
} as const;

/** Minutes elapsed between two ISO timestamps (never negative). */
function minutesBetween(earlier: string, later: string): number {
  const deltaMs = new Date(later).getTime() - new Date(earlier).getTime();
  return Math.max(deltaMs / 60000, 0);
}

/**
 * Analyse a commit timeline and return an advisory integrity result.
 *
 * Pure function: same input always yields the same output.
 */
export function analyzeCommitTimeline(
  commits: CommitEvent[],
): IntegrityAuditResult {
  if (commits.length === 0) {
    return {
      classification: "natural-incremental",
      authenticityScore: 100,
      largestInjectionRatio: 0,
      peakVelocityLinesPerMinute: 0,
      advisory:
        "No commit activity recorded. Advisory signal unavailable; defer to human review.",
      recommendsHumanReview: false,
      annotatedCommits: [],
    };
  }

  // Ensure chronological order without mutating the caller's array.
  const ordered = [...commits].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const totalAdditions = ordered.reduce((sum, c) => sum + c.additions, 0) || 1;

  let peakVelocity = 0;
  let largestInjectionRatio = 0;

  const annotatedCommits: AnnotatedCommit[] = ordered.map((commit, index) => {
    const previous = ordered[index - 1];
    // First commit: assume a reasonable warm-up window so a sensible initial
    // scaffold is not unfairly flagged.
    const elapsedMinutes = previous
      ? minutesBetween(previous.timestamp, commit.timestamp)
      : 5;

    const velocityLinesPerMinute =
      elapsedMinutes > 0
        ? commit.additions / elapsedMinutes
        : commit.additions;

    const injectionRatio = commit.additions / totalAdditions;

    const flagged =
      (velocityLinesPerMinute > INTEGRITY_THRESHOLDS.velocityLinesPerMinute &&
        commit.additions >
          INTEGRITY_THRESHOLDS.largeSingleCommitAdditions) ||
      injectionRatio > INTEGRITY_THRESHOLDS.bulkInjectionRatio;

    peakVelocity = Math.max(peakVelocity, velocityLinesPerMinute);
    largestInjectionRatio = Math.max(largestInjectionRatio, injectionRatio);

    return {
      ...commit,
      velocityLinesPerMinute: Math.round(velocityLinesPerMinute),
      flagged,
    };
  });

  const hasFlag = annotatedCommits.some((c) => c.flagged);
  const classification = hasFlag
    ? "bulk-injection-advisory"
    : "natural-incremental";

  // Authenticity score (advisory, 0-100). Penalise large single injections and
  // high peak velocity, but keep it bounded and interpretable.
  const injectionPenalty = Math.min(largestInjectionRatio, 1) * 55;
  const velocityPenalty =
    Math.min(peakVelocity / INTEGRITY_THRESHOLDS.velocityLinesPerMinute, 1.5) *
    25;
  const authenticityScore = Math.max(
    0,
    Math.round(100 - injectionPenalty - velocityPenalty),
  );

  const advisory = hasFlag
    ? "Advisory: the timeline shows one or more large, high-velocity commits consistent with bulk code injection. This is a signal for a human reviewer to investigate authorship during the Viva Voce, not an automatic disqualifier."
    : "Advisory: the timeline shows steady, incremental commits consistent with natural development. No bulk-injection pattern detected. Human review still recommended before any hiring decision.";

  return {
    classification,
    authenticityScore,
    largestInjectionRatio: Math.round(largestInjectionRatio * 100) / 100,
    peakVelocityLinesPerMinute: Math.round(peakVelocity),
    advisory,
    // Advisory engine always recommends a human in the loop.
    recommendsHumanReview: true,
    annotatedCommits,
  };
}
