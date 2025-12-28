import { config } from "dotenv";

config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda } from "@langchain/core/runnables";
import { SerpAPI } from "@langchain/community/tools/serpapi";

const tool = new SerpAPI();

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
});

const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant."],
    ["placeholder", "{messages}"],
]);

const llmWithTools = llm.bindTools([tool]);

const chain = prompt.pipe(llmWithTools);

const toolChain = RunnableLambda.from(async (userInput: string, config) => {
    const humanMessage = new HumanMessage(userInput);
    const aiMsg = await chain.invoke(
        {
            messages: [new HumanMessage(userInput)],
        },
        config
    );
    const toolMsgs = await tool.batch(aiMsg.tool_calls ?? [], config);
    return chain.invoke(
        {
            messages: [humanMessage, aiMsg, ...toolMsgs],
        },
        config
    );
});

export const callTool = async (prompt: string) => {
    const toolChainResult = await toolChain.invoke(prompt);

    return { content: toolChainResult.content };
};

// Dispute Risk Prediction Agent (rule-based advisory)
export type Milestone = {
    title?: string;
    description?: string;
    value: number; // ETH amount (or unit-agnostic number)
    deadline?: string; // ISO date string
};

export type EscrowInput = {
    scope?: string;
    milestones: Milestone[];
    createdAt?: string; // ISO date
    currency?: string;
};

const containsKeywords = (text: string | undefined, keywords: string[]) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return keywords.some((k) => lower.includes(k));
};

export const predictDisputeRisk = (input: EscrowInput) => {
    const reasons: string[] = [];
    const now = new Date();

    const scope = input.scope ?? "";
    const milestones = input.milestones ?? [];
    const total = milestones.reduce((s, m) => s + (m.value || 0), 0) || 0.000001;

    // 1) Ambiguous scope: short scope or missing acceptance criteria keywords
    const acceptanceKeywords = [
        "accept",
        "deliverable",
        "acceptance",
        "definition of done",
        "spec",
        "requirements",
        "criteria",
    ];

    let ambiguousScore = 0;
    if ((scope || "").trim().length < 60) {
        ambiguousScore += 0.6; // short scope
        reasons.push("Scope is very short — may be ambiguous or underspecified.");
    }
    if (!containsKeywords(scope, acceptanceKeywords)) {
        ambiguousScore += 0.7;
        reasons.push(
            "Scope lacks explicit acceptance criteria or deliverable definitions."
        );
    }

    // 2) Unrealistic deadlines: milestones with deadlines in the past or extremely tight
    let unrealisticCount = 0;
    for (const m of milestones) {
        if (!m.deadline) continue;
        const d = new Date(m.deadline);
        if (isNaN(d.getTime())) continue;
        const msRemaining = d.getTime() - now.getTime();
        const daysRemaining = msRemaining / (1000 * 60 * 60 * 24);
        const share = m.value / total;
        // If deadline is in the past
        if (daysRemaining < 0) {
            unrealisticCount += 1;
            reasons.push(
                `Milestone "${m.title ?? "<unnamed>"}" has a deadline in the past.`
            );
        }
        // If very tight relative to value — e.g., high-value milestone with <3 days
        if (share >= 0.2 && daysRemaining >= 0 && daysRemaining < 3) {
            unrealisticCount += 1;
            reasons.push(
                `High-value milestone "${m.title ?? "<unnamed>"}" has under 3 days.`
            );
        }
        // If any milestone has under 1 day regardless of size
        if (daysRemaining >= 0 && daysRemaining < 1) {
            unrealisticCount += 1;
            reasons.push(
                `Milestone "${m.title ?? "<unnamed>"}" has under 1 day remaining.`
            );
        }
    }

    // 3) Milestone imbalance: one milestone captures too much of total value
    const maxValue = Math.max(...milestones.map((m) => m.value || 0), 0);
    const maxShare = maxValue / total;
    if (maxShare > 0.6) {
        reasons.push(
            `Milestone imbalance: single milestone is ${Math.round(
                maxShare * 100
            )}% of total value.`
        );
    }

    // 4) Few milestones
    if (milestones.length <= 1) {
        reasons.push("Very few milestones — breaks work into a single chunk.");
    }

    // Calculate a simple risk score (0-100). Higher = more risk.
    // Start from 0 and add weighted contributions.
    let score = 0;

    // Ambiguity contributes up to 50 points
    score += Math.min(50, Math.round(ambiguousScore * 50));

    // Unrealistic deadlines contribute up to 30 points (per issue scaled)
    score += Math.min(30, unrealisticCount * 10);

    // Imbalance contributes up to 20 points
    if (maxShare > 0.6) score += Math.round((maxShare - 0.6) / 0.4 * 20);

    // Few milestones add small risk
    if (milestones.length <= 1) score += 10;

    // Clamp
    score = Math.max(0, Math.min(100, score));

    // Construct advisory reasons (deduplicate)
    const uniqueReasons = Array.from(new Set(reasons));

    // Build advisory suggestions
    const suggestions: string[] = [];
    if (uniqueReasons.some((r) => r.includes("acceptance"))) {
        suggestions.push(
            "Add explicit acceptance criteria for each milestone (definition of done)."
        );
    }
    if (uniqueReasons.some((r) => r.includes("deadline"))) {
        suggestions.push("Relax or extend tight deadlines; align time to effort.");
    }
    if (uniqueReasons.some((r) => r.includes("imbalance"))) {
        suggestions.push(
            "Split large milestones into smaller, verifiable chunks with partial payments."
        );
    }
    if (milestones.length <= 1) {
        suggestions.push("Add intermediate milestones to reduce single-point risk.");
    }

    return {
        advisory: true,
        riskScore: score,
        reasons: uniqueReasons,
        suggestions,
        metadata: {
            totalValue: total,
            milestoneCount: milestones.length,
            maxMilestoneShare: Number((maxShare * 100).toFixed(2)),
        },
    };
};