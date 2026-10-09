import type { ProjectBrief } from "@/lib/types";

/**
 * Seeded real-world project brief shown in the Candidate Workspace (View B).
 * Fictional "Company Security Incident Scenario".
 */
export const securityIncidentBrief: ProjectBrief = {
  id: "brief-northwind-incident",
  title: "Contain the Northwind Logistics Credential Leak",
  company: "Northwind Logistics (Fictional)",
  scenario:
    "At 02:14 UTC, Northwind Logistics detected anomalous access to its internal shipment-tracking API. A rotated-but-still-valid service token appears to have leaked through a misconfigured log aggregator. Customer PII was not confirmed exposed, but the token can read and write shipment records. Leadership has asked for a focused, production-ready containment service, not a rewrite of the platform.",
  objectives: [
    "Immediately invalidate the leaked service token without taking the shipment API offline.",
    "Add a short-lived, scoped token issuance flow for internal services.",
    "Ensure tokens never again reach logs or third-party aggregators.",
  ],
  deliverables: [
    "A token-service module (any language) with issue / verify / revoke operations.",
    "A middleware or interceptor that redacts secrets from outbound logs.",
    "A short DESIGN.md defending your trust boundaries and failure modes.",
  ],
  constraints: [
    "Time-boxed to roughly 4 focused hours.",
    "No external paid services; standard libraries and open-source only.",
    "Commit incrementally — your commit timeline is part of the evidence profile.",
  ],
  estimatedHours: 4,
};
