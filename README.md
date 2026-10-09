# ProReady

An employer-led, project-based talent validation platform. ProReady converts
hiring needs into practical, project-based validation pathways, and solves the
emerging-talent catch-22 ("need experience to get experience") by building
functional evidence profiles of demonstrated work.

This repository is a **frontend-only prototype** built for the AWS "Within
Reach" Hackathon. All backend and AI logic is **mocked behind clean, well-named
interfaces** so real integrations can drop in later.

## Stack

- **React 18** + **TypeScript**
- **Vite 5** (dev server + build)
- **Tailwind CSS 3** (enterprise-startup theme: neutral palette, single indigo
  accent, generous spacing, card-based layouts)
- **shadcn/ui-style** primitives (Radix UI + Tailwind + a `cn()` helper), hand
  authored in `src/components/ui`
- **react-router-dom** for routing between the two main views

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev

# 3. Type-check + production build
npm run build

# 4. Preview the production build
npm run preview
```

## Main views

- **View A — Employer / Talent Acquisition Portal** (`/employer`)
  - Incoming candidate stream ranked **strictly by programmatic capability
    score**, not résumés.
  - Interactive evaluation panel per candidate showing **Technical Execution
    Score**, **Integrity / Code Authenticity Metric**, and **Viva Voce
    Comprehension** results, plus the raw submission.
- **View B — Candidate / Emerging Talent Workspace** (`/candidate`)
  - Active assignment layout with a real-world **project brief** (a fictional
    Company Security Incident Scenario).
  - Browser-native **drag-and-drop upload zone** and a **documentation
    workspace** editor.

## Core features (mocked)

### Feature 1 — Git-Commit Timeline Audit Engine

`src/lib/integrityEngine.ts` is a set of **pure functions** that analyse a
seeded commit timeline and classify the work pattern as either
`natural-incremental` development or a possible `bulk-injection-advisory`
(a proxy / copy-paste signal), based on commit velocity and single-commit size.

> **Advisory only.** The Integrity / Code Authenticity metric is an **advisory
> signal intended for human review**. It recommends a closer look during the
> Viva Voce; it is **never** used as an automatic pass/fail disqualifier. This
> framing is surfaced directly in the UI copy.

### Feature 2 — AI Viva Voce Interactive Explainer Agent

`src/lib/bedrockVivaAgent.ts` exposes a clearly named async seam,
`generateVivaQuestions(request)`, representing an **AWS Bedrock** call. Given the
candidate's (mock) code, it returns **3 custom architecture / defense
questions**. The UI (`src/components/VivaVocePanel.tsx`) presents each question
with a **90-second countdown timer**; on timeout the current answer is recorded
automatically.

## Mocked seams and where real integrations plug in

| Concern | Mock location | Real integration |
| --- | --- | --- |
| AWS Bedrock question generation | `generateVivaQuestions` / `mockGenerateVivaQuestions` in `src/lib/bedrockVivaAgent.ts` | Replace the mock body with a `BedrockRuntimeClient` + `InvokeModelCommand` call (see the `TODO(bedrock)` marker). The function signature stays the same, so no UI changes are needed. |
| Git-log parsing | Seeded `CommitEvent[]` in `src/data/candidates.ts` consumed by `analyzeCommitTimeline` | Feed real `git log` output (parsed into `CommitEvent[]`) into the same pure function. |
| File upload | `onDrop` / `addFiles` in `src/components/UploadZone.tsx` (see `TODO(backend)`) | Forward the `FileList` to a real upload endpoint. |
| Viva comprehension scoring | `scoreVivaComprehension` in `src/lib/bedrockVivaAgent.ts` | Replace the heuristic with a second Bedrock grading call. |

## Project structure

```
src/
  components/
    ui/           # shadcn-style primitives (Button, Card, Tabs, Badge, Progress, Textarea)
    AppHeader.tsx
    IntegrityTimeline.tsx   # Feature 1 UI (advisory framing)
    ScoreMeter.tsx
    UploadZone.tsx          # browser-native drag/drop
    VivaVocePanel.tsx       # Feature 2 UI (90s countdown)
  data/
    candidates.ts           # seeded mock candidates + commit timelines
    projectBrief.ts         # seeded security-incident brief
  lib/
    bedrockVivaAgent.ts     # MOCKED Bedrock seam (Feature 2)
    integrityEngine.ts      # pure-function audit engine (Feature 1)
    types.ts                # shared domain types
    utils.ts                # cn() helper
  views/
    EmployerPortal.tsx      # View A
    CandidateWorkspace.tsx  # View B
  App.tsx                   # routing shell
  main.tsx
```

## Note

This is a prototype. Scores, candidates, commit timelines, and AI responses are
seeded or heuristic mocks. The commit-audit **Integrity Metric is an advisory
signal intended for human review**, not an automated hiring decision.
