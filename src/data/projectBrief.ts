import type { ProjectBrief } from "@/lib/types";

/**
 * Seeded real-world project briefs shown in the Candidate Workspace (View B).
 *
 * These case studies are deliberately localized, grassroots civic assignments
 * — "Within Reach" high-impact community work rather than generic corporate
 * mock templates. Each brief maps to a residency pathway a candidate can enter.
 */

/**
 * Pathway A — Cybersecurity Track.
 * Network isolation + privacy compliance audit for a local immigrant-owned
 * small-and-medium-enterprise (SME) network.
 */
export const cybersecurityPathwayBrief: ProjectBrief = {
  id: "brief-sme-network-isolation",
  title:
    "Pathway A: Cybersecurity Track — Local Immigrant-Owned SME Network Isolation & Privacy Compliance Audit",
  company: "Riverside Immigrant SME Collective (Community Partner)",
  scenario:
    "A collective of immigrant-owned corner shops, remittance services, and family clinics share a flat, under-segmented office network behind a single consumer router. Point-of-sale terminals, a shared file server with customer immigration paperwork, and guest Wi-Fi all sit in the same broadcast domain. The collective has asked for a focused, production-ready isolation and privacy audit so a single compromised device cannot expose customer PII or payment data — without buying enterprise hardware they cannot afford.",
  objectives: [
    "Segment point-of-sale, back-office, and guest traffic so a breach in one zone cannot reach customer PII in another.",
    "Produce a privacy compliance checklist mapping where customer immigration and payment data lives and who can reach it.",
    "Harden the shared file server with least-privilege access and auditable, scoped credentials.",
  ],
  deliverables: [
    "A network segmentation plan (VLAN or subnet layout) implementable on affordable, community-grade hardware.",
    "A least-privilege access matrix for the shared file server plus a redaction pass for any logs that leak PII.",
    "A short AUDIT.md defending your trust boundaries, data-flow map, and residual-risk acceptance.",
  ],
  constraints: [
    "Time-boxed to roughly 4 focused hours.",
    "No external paid services; standard libraries, open-source, and community-grade hardware only.",
    "Commit incrementally — your commit timeline is part of the evidence profile.",
  ],
  estimatedHours: 4,
};

/**
 * Pathway B — Solutions Architect Track.
 * Serverless data migration for a neighborhood food rescue bank.
 */
export const solutionsArchitectPathwayBrief: ProjectBrief = {
  id: "brief-food-rescue-serverless-migration",
  title:
    "Pathway B: Solutions Architect Track — Neighborhood Food Rescue Bank Serverless Data Migration Brief",
  company: "Northside Food Rescue Bank (Community Partner)",
  scenario:
    "A volunteer-run neighborhood food rescue bank tracks donations, perishable inventory, and recipient household records in a tangle of aging spreadsheets on one donated laptop. When that laptop fails, the whole operation stops. They need a resilient, low-cost serverless data migration so volunteers can log donations and dispatch perishables from any device, with recipient privacy preserved and near-zero fixed monthly cost.",
  objectives: [
    "Migrate the spreadsheet inventory and donation records into a serverless, pay-per-use data store.",
    "Expose a minimal serverless API for volunteers to log donations and mark perishables dispatched.",
    "Preserve recipient-household privacy with scoped access and no PII in logs or client bundles.",
  ],
  deliverables: [
    "A serverless migration plan (functions + managed data store) with an idempotent import routine for the legacy spreadsheets.",
    "A minimal volunteer-facing API contract (log donation / dispatch perishable / query inventory).",
    "A short DESIGN.md defending your cost model, failure modes, and recipient-privacy trust boundaries.",
  ],
  constraints: [
    "Time-boxed to roughly 4 focused hours.",
    "Near-zero fixed cost — pay-per-use serverless only, no always-on paid infrastructure.",
    "Commit incrementally — your commit timeline is part of the evidence profile.",
  ],
  estimatedHours: 4,
};

/** All active residency pathway briefs, in display order. */
export const residencyBriefs: ProjectBrief[] = [
  cybersecurityPathwayBrief,
  solutionsArchitectPathwayBrief,
];

/**
 * Default active brief surfaced in the Candidate Workspace.
 * Retained as a named export so existing consumers keep working.
 */
export const securityIncidentBrief: ProjectBrief = cybersecurityPathwayBrief;
