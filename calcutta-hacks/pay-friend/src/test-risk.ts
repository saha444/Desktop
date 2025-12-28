import { predictDisputeRisk, type EscrowInput } from "./agent";

// Test Case 1: High-risk escrow (ambiguous scope, tight deadline, imbalance)
const highRiskInput: EscrowInput = {
  scope: "Build stuff",
  milestones: [
    {
      title: "MVP",
      value: 8,
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    },
    {
      title: "Fixes",
      value: 2,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

// Test Case 2: Low-risk escrow (clear scope, realistic deadlines, balanced)
const lowRiskInput: EscrowInput = {
  scope:
    "Develop a React dashboard component with full specifications in the design doc. Acceptance criteria: passes unit tests, <100ms render time, responsive on mobile. Definition of done: code review approved and deployed to staging.",
  milestones: [
    {
      title: "Component Design & Setup",
      value: 2,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: "Core Implementation",
      value: 3,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: "Testing & Polish",
      value: 2,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: "Final Review",
      value: 1,
      deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

// Test Case 3: Medium-risk (single milestone with vague timeline)
const mediumRiskInput: EscrowInput = {
  scope: "Write a blog post about AI",
  milestones: [
    {
      title: "Article",
      value: 5,
      deadline: undefined,
    },
  ],
};

console.log("=== PAYCHECK DISPUTE RISK PREDICTION ===\n");

console.log("Test 1: HIGH-RISK Escrow");
const highRisk = predictDisputeRisk(highRiskInput);
console.log(`Risk Score: ${highRisk.riskScore}/100`);
console.log("Reasons:", highRisk.reasons);
console.log("Suggestions:", highRisk.suggestions);
console.log("Metadata:", highRisk.metadata);
console.log("\n---\n");

console.log("Test 2: LOW-RISK Escrow");
const lowRisk = predictDisputeRisk(lowRiskInput);
console.log(`Risk Score: ${lowRisk.riskScore}/100`);
console.log("Reasons:", lowRisk.reasons);
console.log("Suggestions:", lowRisk.suggestions);
console.log("Metadata:", lowRisk.metadata);
console.log("\n---\n");

console.log("Test 3: MEDIUM-RISK Escrow");
const mediumRisk = predictDisputeRisk(mediumRiskInput);
console.log(`Risk Score: ${mediumRisk.riskScore}/100`);
console.log("Reasons:", mediumRisk.reasons);
console.log("Suggestions:", mediumRisk.suggestions);
console.log("Metadata:", mediumRisk.metadata);