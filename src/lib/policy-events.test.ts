import { expect, test } from "bun:test";
import policies from "./policy-events.fixtures.json";
import { policyDateSchema, policyEvidenceSchema } from "./policy-evidence";

function rollout() {
  const policy = policies.find((row) => row.id === "51561c2b-a955-4b42-8d0b-b7a1e73253e2");
  if (!policy) throw new Error("Missing documented UK rollout");
  return policy;
}

test("documented announcement date is April 4, distinct from announced April 15 start", () => {
  const policy = rollout();
  expect([policy.announcement_date, policy.effective_date, policy.last_verified]).toEqual(["2025-04-04", "2025-04-15", "2026-10-29"]);
  expect(policyDateSchema.safeParse(policy).success).toBe(true);
});
test("UK rollout does not apply to business sellers or assert universal enforcement", () => {
  const evidence = policyEvidenceSchema.parse(rollout().evidence_details);
  expect(evidence.scope).toBe("eBay.co.uk UK private sellers listing eligible items; not business sellers or all categories");
  expect(evidence.conditions).toContain("15 April 2025 is the announced start for new listings, not verified universal enforcement.");
});
test("existing listings have a distinct announced April 7 through month-end transition", () => {
  const evidence = policyEvidenceSchema.parse(rollout().evidence_details);
  expect(evidence.conditions).toContain("Eligible existing listings were scheduled to transition from 7 April through the end of April 2025; completion is not independently established.");
});
test("policy dataset retains only the same independently documented historical event", () => {
  expect(policies.map((row) => row.id)).toEqual(["51561c2b-a955-4b42-8d0b-b7a1e73253e2"]);
  expect(policyEvidenceSchema.parse(rollout().evidence_details).status).toBe("verified_policy_event");
});