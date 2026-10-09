import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Timer, CheckCircle2 } from "lucide-react";
import {
  generateVivaQuestions,
  scoreVivaComprehension,
  VIVA_TIME_LIMIT_SECONDS,
} from "@/lib/bedrockVivaAgent";
import type { VivaAnswer, VivaQuestion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface VivaVocePanelProps {
  code: string;
  documentation?: string;
  assignmentTitle?: string;
}

type Phase = "idle" | "loading" | "answering" | "complete";

/**
 * Feature 2 UI — AI Viva Voce Interactive Explainer Agent.
 *
 * Calls the mocked Bedrock seam (`generateVivaQuestions`) to produce 3 custom
 * questions, then presents each with a 90-second countdown timer.
 */
export function VivaVocePanel({
  code,
  documentation,
  assignmentTitle,
}: VivaVocePanelProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<VivaQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState<VivaAnswer[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(VIVA_TIME_LIMIT_SECONDS);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const recordAnswer = useCallback(
    (opts: { timedOut: boolean }) => {
      const question = questions[current];
      if (!question) return;

      clearTimer();
      const answer: VivaAnswer = {
        questionId: question.id,
        answer: draft,
        secondsRemaining: opts.timedOut ? 0 : secondsLeft,
        timedOut: opts.timedOut,
      };
      const nextAnswers = [...answers, answer];
      setAnswers(nextAnswers);
      setDraft("");

      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
        setSecondsLeft(VIVA_TIME_LIMIT_SECONDS);
      } else {
        setPhase("complete");
      }
    },
    [answers, clearTimer, current, draft, questions, secondsLeft],
  );

  // Keep a ref to the latest recordAnswer so the interval always sees it.
  const recordRef = useRef(recordAnswer);
  useEffect(() => {
    recordRef.current = recordAnswer;
  }, [recordAnswer]);

  // Drive the countdown while answering.
  useEffect(() => {
    if (phase !== "answering") return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit (timed out) on the next tick boundary.
          queueMicrotask(() => recordRef.current({ timedOut: true }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, [phase, current, clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  async function start() {
    setPhase("loading");
    setAnswers([]);
    setCurrent(0);
    setDraft("");
    setSecondsLeft(VIVA_TIME_LIMIT_SECONDS);
    const generated = await generateVivaQuestions({
      code,
      documentation,
      assignmentTitle,
    });
    setQuestions(generated);
    setPhase("answering");
  }

  if (phase === "idle") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed p-6">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-primary" />
          <span className="font-semibold">AI Viva Voce Explainer Agent</span>
          <Badge variant="secondary">Mocked AWS Bedrock</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          On submission, the agent reads the candidate's code and generates 3
          custom architecture and defense questions. Each must be answered
          within a {VIVA_TIME_LIMIT_SECONDS}-second countdown to validate
          genuine comprehension of the work.
        </p>
        <Button onClick={start}>
          <Bot className="size-4" /> Generate Viva Voce questions
        </Button>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" />
        Invoking Bedrock explainer agent and analysing the submission…
      </div>
    );
  }

  if (phase === "complete") {
    const score = scoreVivaComprehension(answers);
    return (
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-success" />
          <span className="font-semibold">Viva Voce complete</span>
          <Badge variant="success">Comprehension {score}/100</Badge>
        </div>
        <ul className="space-y-3">
          {answers.map((a, i) => (
            <li key={a.questionId} className="rounded-md border bg-card p-3">
              <p className="text-sm font-medium">
                Q{i + 1}: {questions[i]?.prompt}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {a.timedOut && !a.answer
                  ? "— No answer submitted before the timer expired —"
                  : a.answer || "— (empty) —"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {a.timedOut
                  ? "Timed out"
                  : `Submitted with ${a.secondsRemaining}s remaining`}
              </p>
            </li>
          ))}
        </ul>
        <Button variant="outline" onClick={start}>
          Run again
        </Button>
      </div>
    );
  }

  // phase === "answering"
  const question = questions[current];
  const pct = (secondsLeft / VIVA_TIME_LIMIT_SECONDS) * 100;
  const low = secondsLeft <= 15;

  return (
    <div className="space-y-4 rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-primary" />
          <span className="font-semibold">
            Question {current + 1} of {questions.length}
          </span>
          <Badge variant="outline" className="capitalize">
            {question.focusArea.replace("-", " ")}
          </Badge>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 text-sm font-semibold tabular-nums",
            low ? "text-destructive" : "text-foreground",
          )}
        >
          <Timer className="size-4" />
          {secondsLeft}s
        </div>
      </div>

      <Progress
        value={pct}
        indicatorClassName={low ? "bg-destructive" : "bg-primary"}
      />

      <p className="text-sm font-medium text-foreground">{question.prompt}</p>

      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Defend your engineering choices here…"
        className="min-h-[140px]"
        autoFocus
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Answer before the countdown reaches zero. On timeout, your current
          text is recorded automatically.
        </span>
        <Button onClick={() => recordAnswer({ timedOut: false })}>
          {current + 1 < questions.length ? "Submit & next" : "Submit & finish"}
        </Button>
      </div>
    </div>
  );
}
