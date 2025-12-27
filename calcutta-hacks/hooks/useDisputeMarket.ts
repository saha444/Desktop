"use client";

import { useState, useEffect, useCallback } from "react";

export interface MarketOutcome {
    label: string;
    description: string;
    totalEth: string;
    weightedEth: string;
    percentageShare: number;
}

export interface DisputeMarketData {
    id: string;
    escrowAddress: string;
    question: string;
    status: "ACTIVE" | "RESOLVED" | "EXPIRED";
    createdAt: Date;
    deadline: Date;
    yesOutcome: MarketOutcome;
    noOutcome: MarketOutcome;
    clientBond: string;
    freelancerBond: string;
    winningOutcome: "YES" | "NO" | null;
}

export interface UseDisputeMarketReturn {
    market: DisputeMarketData | null;
    isLoading: boolean;
    error: string | null;
    depositAmount: string;
    setDepositAmount: (amount: string) => void;
    selectedOutcome: "YES" | "NO" | null;
    setSelectedOutcome: (outcome: "YES" | "NO" | null) => void;
    isDepositing: boolean;
    deposit: () => Promise<void>;
    getTimeWeightedImpact: () => { multiplier: string; effectiveEth: string };
    getPotentialPayout: () => string;
    refresh: () => Promise<void>;
}

// Generate mock market data
function generateMockMarket(id: string): DisputeMarketData {
    const idNum = parseInt(id, 10) || parseInt(id.slice(-8), 16) || 1;
    const now = Date.now();
    const createdAt = new Date(now - ((idNum % 20) + 4) * 60 * 60 * 1000);
    const deadline = new Date(now + ((24 - (idNum % 20)) * 60 * 60 * 1000));

    const yesTotalEth = ((idNum % 30) / 10 + 0.5).toFixed(2);
    const noTotalEth = ((idNum % 25) / 10 + 0.3).toFixed(2);

    const yesWeighted = (parseFloat(yesTotalEth) * 1.2).toFixed(3);
    const noWeighted = (parseFloat(noTotalEth) * 0.9).toFixed(3);

    const totalWeighted = parseFloat(yesWeighted) + parseFloat(noWeighted);
    const yesPercent = Math.round((parseFloat(yesWeighted) / totalWeighted) * 100);
    const noPercent = 100 - yesPercent;

    // Determine market status: ACTIVE if not past deadline, otherwise randomly RESOLVED or EXPIRED
    const isPastDeadline = deadline.getTime() <= now;
    const status: "ACTIVE" | "RESOLVED" | "EXPIRED" = isPastDeadline
        ? (idNum % 3 === 0 ? "EXPIRED" : "RESOLVED")
        : "ACTIVE";

    return {
        id,
        escrowAddress: "0x" + "e".repeat(38) + id.slice(-2).padStart(2, '0'),
        question: "Was the milestone completed as specified?",
        status,
        createdAt,
        deadline,
        yesOutcome: {
            label: "YES",
            description: "Freelancer Completed Work",
            totalEth: yesTotalEth,
            weightedEth: yesWeighted,
            percentageShare: yesPercent,
        },
        noOutcome: {
            label: "NO",
            description: "Milestone Not Completed",
            totalEth: noTotalEth,
            weightedEth: noWeighted,
            percentageShare: noPercent,
        },
        clientBond: ((idNum % 10) / 10 + 0.2).toFixed(2),
        freelancerBond: ((idNum % 10) / 10 + 0.2).toFixed(2),
        winningOutcome: status === "RESOLVED" ? (idNum % 2 === 0 ? "YES" : "NO") : null,
    };
}

export function useDisputeMarket(marketId: string): UseDisputeMarketReturn {
    const [market, setMarket] = useState<DisputeMarketData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [depositAmount, setDepositAmount] = useState("");
    const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO" | null>(null);
    const [isDepositing, setIsDepositing] = useState(false);

    const fetchMarket = useCallback(async () => {
        if (!marketId) {
            setError("No market ID provided");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await new Promise((r) => setTimeout(r, 500));
            const mockMarket = generateMockMarket(marketId);
            setMarket(mockMarket);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch market");
        } finally {
            setIsLoading(false);
        }
    }, [marketId]);

    useEffect(() => {
        fetchMarket();
    }, [fetchMarket]);

    const getTimeWeightedImpact = useCallback(() => {
        if (!market || !depositAmount) {
            return { multiplier: "1.00x", effectiveEth: "0" };
        }

        const now = Date.now();
        const timeRemaining = market.deadline.getTime() - now;
        const totalDuration = market.deadline.getTime() - market.createdAt.getTime();
        const percentRemaining = timeRemaining / totalDuration;

        // Earlier deposits get higher multiplier (1.0 - 2.0x)
        const multiplier = 1 + percentRemaining;
        const amount = parseFloat(depositAmount) || 0;
        const effectiveEth = (amount * multiplier).toFixed(4);

        return {
            multiplier: multiplier.toFixed(2) + "x",
            effectiveEth,
        };
    }, [market, depositAmount]);

    const getPotentialPayout = useCallback(() => {
        if (!market || !depositAmount || !selectedOutcome) return "0";

        const amount = parseFloat(depositAmount) || 0;
        const { effectiveEth } = getTimeWeightedImpact();
        const myWeighted = parseFloat(effectiveEth);

        const outcome = selectedOutcome === "YES" ? market.yesOutcome : market.noOutcome;
        const oppositeOutcome = selectedOutcome === "YES" ? market.noOutcome : market.yesOutcome;

        const totalPool = parseFloat(outcome.totalEth) + parseFloat(oppositeOutcome.totalEth) + amount;
        const myShareOfOutcome = myWeighted / (parseFloat(outcome.weightedEth) + myWeighted);
        const potentialWin = totalPool * myShareOfOutcome;

        return potentialWin.toFixed(4);
    }, [market, depositAmount, selectedOutcome, getTimeWeightedImpact]);

    const deposit = useCallback(async () => {
        if (!depositAmount || !selectedOutcome) return;

        setIsDepositing(true);
        try {
            await new Promise((r) => setTimeout(r, 2000));
            // Reset form
            setDepositAmount("");
            setSelectedOutcome(null);
            await fetchMarket();
        } finally {
            setIsDepositing(false);
        }
    }, [depositAmount, selectedOutcome, fetchMarket]);

    return {
        market,
        isLoading,
        error,
        depositAmount,
        setDepositAmount,
        selectedOutcome,
        setSelectedOutcome,
        isDepositing,
        deposit,
        getTimeWeightedImpact,
        getPotentialPayout,
        refresh: fetchMarket,
    };
}

export function formatCountdown(deadline: Date): string {
    const now = Date.now();
    const diff = deadline.getTime() - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}
