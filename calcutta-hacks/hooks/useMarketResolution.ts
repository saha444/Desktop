"use client";

import { useState, useEffect, useCallback } from "react";

export interface PayoutBreakdown {
    winnerPrincipal: string;
    shareFromLosingPool: string;
    protocolFee: string;
    totalPayout: string;
}

export interface ResolutionData {
    id: string;
    escrowAddress: string;
    question: string;
    resolvedAt: Date;
    winningOutcome: "YES" | "NO";

    // Pool Data
    yesPool: {
        totalEth: string;
        weightedEth: string;
        participants: number;
    };
    noPool: {
        totalEth: string;
        weightedEth: string;
        participants: number;
    };

    // User's participation
    userDeposit: {
        amount: string;
        weightedAmount: string;
        outcome: "YES" | "NO";
        depositedAt: Date;
    } | null;

    // Payout
    payout: PayoutBreakdown | null;
    hasClaimed: boolean;
}

export interface UseMarketResolutionReturn {
    resolution: ResolutionData | null;
    isLoading: boolean;
    error: string | null;
    isClaiming: boolean;
    claimFunds: () => Promise<void>;
    refresh: () => Promise<void>;
}

// Generate mock resolution data
function generateMockResolution(id: string): ResolutionData {
    const idNum = parseInt(id, 10) || parseInt(id.slice(-8), 16) || 1;
    const now = Date.now();
    const resolvedAt = new Date(now - ((idNum % 5) + 1) * 60 * 60 * 1000); // Resolved 1-5 hours ago

    const winningOutcome: "YES" | "NO" = idNum % 2 === 0 ? "YES" : "NO";

    // Pool sizes
    const yesTotalEth = ((idNum % 30) / 10 + 0.5).toFixed(3);
    const noTotalEth = ((idNum % 25) / 10 + 0.3).toFixed(3);
    const yesWeighted = (parseFloat(yesTotalEth) * 1.2).toFixed(3);
    const noWeighted = (parseFloat(noTotalEth) * 0.9).toFixed(3);

    // User deposit simulation
    const userParticipated = idNum % 3 !== 0; // 2/3 chance user participated
    const userWon = userParticipated && ((idNum % 4 < 2 && winningOutcome === "YES") || (idNum % 4 >= 2 && winningOutcome === "NO"));

    const userDeposit = userParticipated ? {
        amount: ((idNum % 5) / 10 + 0.1).toFixed(3),
        weightedAmount: ((idNum % 5) / 10 + 0.1).toFixed(3),
        outcome: (idNum % 4 < 2 ? "YES" : "NO") as "YES" | "NO",
        depositedAt: new Date(resolvedAt.getTime() - 12 * 60 * 60 * 1000),
    } : null;

    // Payout calculation (only if user participated and won)
    let payout: PayoutBreakdown | null = null;
    if (userWon && userDeposit) {
        const winningPool = winningOutcome === "YES" ? parseFloat(yesTotalEth) : parseFloat(noTotalEth);
        const losingPool = winningOutcome === "YES" ? parseFloat(noTotalEth) : parseFloat(yesTotalEth);
        const winningWeighted = winningOutcome === "YES" ? parseFloat(yesWeighted) : parseFloat(noWeighted);

        const userWeight = parseFloat(userDeposit.weightedAmount);
        const userSharePercent = userWeight / winningWeighted;

        const protocolFeeRate = 0.025; // 2.5% protocol fee
        const losingPoolAfterFee = losingPool * (1 - protocolFeeRate);
        const shareFromLosing = losingPoolAfterFee * userSharePercent;

        payout = {
            winnerPrincipal: userDeposit.amount,
            shareFromLosingPool: shareFromLosing.toFixed(4),
            protocolFee: (losingPool * protocolFeeRate * userSharePercent).toFixed(4),
            totalPayout: (parseFloat(userDeposit.amount) + shareFromLosing).toFixed(4),
        };
    }

    return {
        id,
        escrowAddress: "0x" + "e".repeat(38) + id.slice(-2).padStart(2, '0'),
        question: "Was the milestone completed as specified?",
        resolvedAt,
        winningOutcome,
        yesPool: {
            totalEth: yesTotalEth,
            weightedEth: yesWeighted,
            participants: (idNum % 15) + 3,
        },
        noPool: {
            totalEth: noTotalEth,
            weightedEth: noWeighted,
            participants: (idNum % 10) + 2,
        },
        userDeposit,
        payout,
        hasClaimed: false,
    };
}

export function useMarketResolution(marketId: string): UseMarketResolutionReturn {
    const [resolution, setResolution] = useState<ResolutionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isClaiming, setIsClaiming] = useState(false);

    const fetchResolution = useCallback(async () => {
        if (!marketId) {
            setError("No market ID provided");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await new Promise((r) => setTimeout(r, 500));
            const mockResolution = generateMockResolution(marketId);
            setResolution(mockResolution);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch resolution");
        } finally {
            setIsLoading(false);
        }
    }, [marketId]);

    useEffect(() => {
        fetchResolution();
    }, [fetchResolution]);

    const claimFunds = useCallback(async () => {
        if (!resolution || !resolution.payout || resolution.hasClaimed) return;

        setIsClaiming(true);
        try {
            // Simulate blockchain transaction
            await new Promise((r) => setTimeout(r, 2000));
            setResolution((prev) => prev ? { ...prev, hasClaimed: true } : null);
        } finally {
            setIsClaiming(false);
        }
    }, [resolution]);

    return {
        resolution,
        isLoading,
        error,
        isClaiming,
        claimFunds,
        refresh: fetchResolution,
    };
}

export function formatTimeSince(date: Date): string {
    const now = Date.now();
    const diff = now - date.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
}
