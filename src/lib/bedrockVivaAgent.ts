/**
 * Feature 2 — AI Viva Voce Interactive Explainer Agent (MOCKED).
 *
 * This module represents a call to AWS Bedrock. Given a candidate's code input,
 * it returns 3 custom architecture/defense questions that the candidate must
 * answer within a 90-second countdown per question (the timer lives in the UI).
 *
 * ---------------------------------------------------------------------------
 * MOCKED SEAM
 * ---------------------------------------------------------------------------
 * `generateVivaQuestions` is the clearly named async interface the rest of the
 * app depends on. The current implementation returns deterministic, seeded
 * questions derived from lightweight heuristics over the submitted code.
 *
 * TODO(bedrock): Replace `mockGenerateVivaQuestions` with a real AWS Bedrock
 * invocation. Suggested wiring:
 *   - import { BedrockRuntimeClient, InvokeModelCommand } from
 *     "@aws-sdk/client-bedrock-runtime";
 *   - Build a prompt from `request.code` + `request.documentation`.
 *   - Call InvokeModelCommand (e.g. Anthropic Claude on Bedrock) and parse the
 *     3 returned questions into `VivaQuestion[]`.
 *   - Keep this function signature identical so no UI changes are required.
 */

import type { VivaQuestion } from "./types";

export interface GenerateVivaQuestionsRequest {
  /** The candidate's submitted code (used to seed custom questions). */
  code: string;
  /** Optional supporting documentation the candidate wrote. */
  documentation?: string;
  /** Title of the assignment, for prompt context. */
  assignmentTitle?: string;
}

/** The time limit, in seconds, a candidate has to answer each question. */
export const VIVA_TIME_LIMIT_SECONDS = 90;

/**
 * Public async seam the UI calls. Delegates to the mock implementation today;
 * swap the body for a real Bedrock call later (see TODO above).
 */
export async function generateVivaQuestions(
  request: GenerateVivaQuestionsRequest,
): Promise<VivaQuestion[]> {
  // TODO(bedrock): replace this line with the real Bedrock invocation.
  return mockGenerateVivaQuestions(request);
}

/** Simple keyword probe so mocked questions feel tailored to the submission. */
function detectSignals(code: string) {
  const lower = code.toLowerCase();
  return {
    usesAuth: /(auth|jwt|token|oauth|session|password|bcrypt)/.test(lower),
    usesCrypto: /(encrypt|aes|rsa|hash|sha256|cipher|tls)/.test(lower),
    usesDatabase: /(select |insert |db\.|query|sql|mongo|prisma|repository)/.test(
      lower,
    ),
    usesNetwork: /(fetch|axios|http|request|socket|api)/.test(lower),
    usesRetry: /(retry|backoff|timeout|circuit)/.test(lower),
  };
}

/**
 * Deterministic mock of the Bedrock explainer agent. Returns exactly three
 * questions biased toward whatever signals appear in the candidate's code.
 */
export async function mockGenerateVivaQuestions(
  request: GenerateVivaQuestionsRequest,
): Promise<VivaQuestion[]> {
  // Simulate network/model latency so the UI loading state is exercised.
  await new Promise((resolve) => setTimeout(resolve, 650));

  const signals = detectSignals(request.code ?? "");

  const architectureQuestion: VivaQuestion = {
    id: "viva-architecture",
    focusArea: "architecture",
    prompt: signals.usesDatabase
      ? "Walk us through how data flows through your solution, from the untrusted input boundary to persistence. Where did you choose to validate, and why there specifically?"
      : "Describe the top-level architecture of your submission. What are the main components and why did you draw the boundaries where you did?",
  };

  const securityQuestion: VivaQuestion = {
    id: "viva-security",
    focusArea: "security",
    prompt: signals.usesAuth
      ? "You handle authentication in this submission. Defend your choice of credential handling and session strategy against a replay or token-theft attacker."
      : signals.usesCrypto
        ? "You use cryptographic primitives here. Justify your algorithm and key-management choices, and name one failure mode you deliberately guarded against."
        : "Given this is a security incident scenario, identify the single most dangerous assumption in your design and explain how you contained its blast radius.",
  };

  const tradeOffsQuestion: VivaQuestion = {
    id: "viva-trade-offs",
    focusArea: "trade-offs",
    prompt: signals.usesRetry
      ? "You added retry/timeout handling. Defend those parameters: what happens under a sustained downstream outage, and why won't your approach amplify the incident?"
      : signals.usesNetwork
        ? "Your solution makes network calls. What trade-off did you accept around latency, failure handling, or consistency, and what would you change at 100x scale?"
        : "What was the most significant engineering trade-off you made under the time constraint, and what would you revisit with another day of work?",
  };

  return [architectureQuestion, securityQuestion, tradeOffsQuestion];
}

/**
 * MOCKED scoring of Viva Voce answers. In production this would be a second
 * Bedrock call that grades comprehension; here we use a transparent heuristic
 * so the demo surfaces a plausible comprehension score.
 */
export function scoreVivaComprehension(
  answers: { answer: string; timedOut: boolean }[],
): number {
  if (answers.length === 0) return 0;
  const perAnswer = answers.map((a) => {
    if (a.timedOut) return 20;
    const words = a.answer.trim().split(/\s+/).filter(Boolean).length;
    // Reward structured, substantive defenses; cap so it stays advisory.
    const base = Math.min(words / 60, 1) * 85;
    return Math.round(15 + base);
  });
  return Math.round(perAnswer.reduce((s, v) => s + v, 0) / perAnswer.length);
}
