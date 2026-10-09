import type { Candidate } from "@/lib/types";

/**
 * Seeded, realistic mock candidates for the Employer Portal (View A).
 *
 * Each candidate carries a commit timeline (consumed by the Integrity Audit
 * Engine) and a code submission (consumed by the mocked Bedrock Viva agent).
 * The timelines are deliberately varied so the advisory engine produces a mix
 * of "natural-incremental" and "bulk-injection-advisory" classifications.
 */

const naturalTimeline = (startIso: string) => {
  const start = new Date(startIso).getTime();
  const step = 22 * 60 * 1000; // ~22 min between commits
  const sizes = [
    { a: 48, d: 2, m: "scaffold token service module + interfaces" },
    { a: 73, d: 9, m: "implement issue() with short-lived scoped claims" },
    { a: 61, d: 14, m: "add verify() + signature validation" },
    { a: 55, d: 21, m: "add revoke() with in-memory denylist" },
    { a: 42, d: 11, m: "log redaction middleware for secrets" },
    { a: 38, d: 17, m: "unit tests for issue/verify/revoke" },
    { a: 29, d: 8, m: "write DESIGN.md trust boundaries" },
  ];
  return sizes.map((s, i) => ({
    hash: `a1b${i}c${(i * 7) % 10}f`,
    timestamp: new Date(start + i * step).toISOString(),
    message: s.m,
    additions: s.a,
    deletions: s.d,
  }));
};

const bulkTimeline = (startIso: string) => {
  const start = new Date(startIso).getTime();
  return [
    {
      hash: "f00dcafe",
      timestamp: new Date(start).toISOString(),
      message: "initial commit",
      additions: 6,
      deletions: 0,
    },
    {
      hash: "deadbeef",
      timestamp: new Date(start + 3 * 60 * 1000).toISOString(),
      message: "add complete token service implementation",
      additions: 612,
      deletions: 1,
    },
    {
      hash: "0ff1ce00",
      timestamp: new Date(start + 7 * 60 * 1000).toISOString(),
      message: "fix import",
      additions: 3,
      deletions: 2,
    },
  ];
};

export const candidates: Candidate[] = [
  {
    id: "cand-amara-okafor",
    name: "Amara Okafor",
    headline: "Backend engineer • distributed systems focus",
    avatarInitials: "AO",
    capabilityScore: 92,
    technicalExecutionScore: 94,
    vivaVoceComprehensionScore: 90,
    assignmentTitle: "Contain the Northwind Logistics Credential Leak",
    commitTimeline: naturalTimeline("2024-05-02T09:03:00Z"),
    codeSubmission: `// token-service.ts
import { createHmac, randomBytes } from "crypto";

const SECRET = process.env.TOKEN_SIGNING_KEY ?? "";
const denylist = new Set<string>();

export function issue(scope: string[], ttlSeconds = 300) {
  const payload = { scope, exp: Date.now() + ttlSeconds * 1000, jti: randomBytes(8).toString("hex") };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return body + "." + sig;
}

export function verify(token: string) {
  const [body, sig] = token.split(".");
  const expected = createHmac("sha256", SECRET).update(body).digest("base64url");
  if (sig !== expected) throw new Error("bad signature");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString());
  if (payload.exp < Date.now()) throw new Error("expired");
  if (denylist.has(payload.jti)) throw new Error("revoked");
  return payload;
}

export function revoke(jti: string) { denylist.add(jti); }`,
    documentation:
      "Chose HMAC-signed, short-lived tokens (300s) so a leaked token self-expires quickly. Revocation uses an in-memory denylist keyed by jti; in production this moves to Redis with TTL. Secrets are read from env and never logged.",
  },
  {
    id: "cand-diego-martins",
    name: "Diego Martins",
    headline: "Full-stack developer • security-curious",
    avatarInitials: "DM",
    capabilityScore: 81,
    technicalExecutionScore: 83,
    vivaVoceComprehensionScore: 78,
    assignmentTitle: "Contain the Northwind Logistics Credential Leak",
    commitTimeline: naturalTimeline("2024-05-02T13:40:00Z"),
    codeSubmission: `# token_service.py
import time, hmac, hashlib, os, secrets

SECRET = os.environ.get("TOKEN_SIGNING_KEY", "").encode()
_revoked = set()

def issue(scope, ttl=300):
    jti = secrets.token_hex(8)
    exp = int(time.time()) + ttl
    msg = f"{jti}:{exp}:{','.join(scope)}".encode()
    sig = hmac.new(SECRET, msg, hashlib.sha256).hexdigest()
    return f"{jti}.{exp}.{sig}"

def verify(token):
    jti, exp, sig = token.split(".")
    msg = f"{jti}:{exp}:".encode()
    # NOTE: scope omitted from recomputation here
    if int(exp) < time.time():
        raise ValueError("expired")
    if jti in _revoked:
        raise ValueError("revoked")
    return jti

def revoke(jti):
    _revoked.add(jti)`,
    documentation:
      "Implemented an HMAC token with TTL and a revocation set. I know the verify() scope recomputation is incomplete and would fix it before shipping. Logging interceptor strips Authorization headers.",
  },
  {
    id: "cand-priya-nair",
    name: "Priya Nair",
    headline: "Platform engineer • reliability + observability",
    avatarInitials: "PN",
    capabilityScore: 88,
    technicalExecutionScore: 86,
    vivaVoceComprehensionScore: 91,
    assignmentTitle: "Contain the Northwind Logistics Credential Leak",
    commitTimeline: naturalTimeline("2024-05-01T18:12:00Z"),
    codeSubmission: `// redactor.ts — outbound log redaction middleware
const SECRET_PATTERNS = [/bearer\\s+[a-z0-9._-]+/gi, /token=\\S+/gi, /key-[a-z0-9]{16,}/gi];

export function redact(line: string): string {
  return SECRET_PATTERNS.reduce((acc, re) => acc.replace(re, "[REDACTED]"), line);
}

export function logInterceptor(next: (l: string) => void) {
  return (line: string) => next(redact(line));
}

// retry with capped exponential backoff + jitter
export async function withRetry<T>(fn: () => Promise<T>, max = 3) {
  let attempt = 0;
  for (;;) {
    try { return await fn(); }
    catch (e) {
      if (++attempt >= max) throw e;
      const delay = Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 250;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}`,
    documentation:
      "Focused on the leak vector itself: redaction middleware plus bounded retries so containment tooling cannot amplify an outage. Backoff is capped at 8s with jitter to avoid thundering-herd on the auth service.",
  },
  {
    id: "cand-sam-whitfield",
    name: "Sam Whitfield",
    headline: "Bootcamp graduate • first evidence profile",
    avatarInitials: "SW",
    capabilityScore: 64,
    technicalExecutionScore: 67,
    vivaVoceComprehensionScore: 58,
    assignmentTitle: "Contain the Northwind Logistics Credential Leak",
    commitTimeline: bulkTimeline("2024-05-03T22:05:00Z"),
    codeSubmission: `// solution.js
const jwt = require("jsonwebtoken");
const SECRET = "supersecret"; // TODO move to env

function issue(scope) { return jwt.sign({ scope }, SECRET, { expiresIn: "1h" }); }
function verify(t) { return jwt.verify(t, SECRET); }
function revoke(t) { /* not implemented */ }

module.exports = { issue, verify, revoke };`,
    documentation:
      "Used jsonwebtoken to sign tokens. Ran out of time for revocation and the secret is still hardcoded.",
  },
  {
    id: "cand-lena-kovac",
    name: "Lena Kovač",
    headline: "Security engineer • appsec + cryptography",
    avatarInitials: "LK",
    capabilityScore: 90,
    technicalExecutionScore: 91,
    vivaVoceComprehensionScore: 88,
    assignmentTitle: "Contain the Northwind Logistics Credential Leak",
    commitTimeline: naturalTimeline("2024-05-02T07:25:00Z"),
    codeSubmission: `// token.rs — scoped, short-lived service tokens
use hmac::{Hmac, Mac};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

pub fn issue(secret: &[u8], scope: &str, exp_unix: u64, jti: &str) -> String {
    let msg = format!("{jti}:{exp_unix}:{scope}");
    let mut mac = HmacSha256::new_from_slice(secret).expect("key");
    mac.update(msg.as_bytes());
    let sig = hex::encode(mac.finalize().into_bytes());
    format!("{msg}:{sig}")
}

pub fn verify(secret: &[u8], token: &str, now: u64, revoked: &[&str]) -> Result<(), &'static str> {
    let parts: Vec<&str> = token.rsplitn(2, ':').collect();
    let (sig, msg) = (parts[0], parts[1]);
    let mut mac = HmacSha256::new_from_slice(secret).expect("key");
    mac.update(msg.as_bytes());
    let expected = hex::encode(mac.finalize().into_bytes());
    if expected != sig { return Err("bad signature"); }
    let jti = msg.split(':').next().unwrap();
    if revoked.contains(&jti) { return Err("revoked"); }
    Ok(())
}`,
    documentation:
      "Constant-time-ish HMAC verification in Rust, scope bound into the signed message so it cannot be tampered. Revocation list injected for testability. Secret never touches logs; redaction layer added separately.",
  },
];

/** Candidates ranked strictly by programmatic capability score (desc). */
export function rankedCandidates(): Candidate[] {
  return [...candidates].sort((a, b) => b.capabilityScore - a.capabilityScore);
}
