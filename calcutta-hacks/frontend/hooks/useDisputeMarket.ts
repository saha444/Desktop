"use client";

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, ethers } from "ethers";
import { useWallet } from "./useWallet";
import {
    getDisputeModule,
    getDisputeDetails,
    DisputeState,
    Vote,
    formatEth,
} from "@/lib/contracts";

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
    isContractData: boolean;
}

// Generate mock market data (fallback)
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
    const { isConnected, isCorrectNetwork } = useWallet();
    const [market, setMarket] = useState<DisputeMarketData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isContractData, setIsContractData] = useState(false);

    const [depositAmount, setDepositAmount] = useState("");
    const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO" | null>(null);
    const [isDepositing, setIsDepositing] = useState(false);

    const getProvider = useCallback((): BrowserProvider | null => {
        if (typeof window === "undefined" || !window.ethereum) {
            return null;
        }
        return new BrowserProvider(window.ethereum);
    }, []);

    const fetchMarket = useCallback(async () => {
        if (!marketId) {
            setError("No market ID provided");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const provider = getProvider();
            const disputeId = parseInt(marketId, 10);

            // Try to fetch real data from contract if connected
            if (provider && isConnected && isCorrectNetwork && !isNaN(disputeId)) {
                try {
                    console.log("Fetching dispute details from contract:", disputeId);
                    const dispute = await getDisputeDetails(provider, disputeId);

                    // Map contract state to UI status
                    let status: "ACTIVE" | "RESOLVED" | "EXPIRED";
                    let winningOutcome: "YES" | "NO" | null = null;

                    switch (dispute.state) {
                        case DisputeState.ACTIVE:
                            status = "ACTIVE";
                            break;
                        case DisputeState.RESOLVED:
                            status = "RESOLVED";
                            // Outcome: 1 = Freelancer wins (YES), 2 = Client wins (NO)
                            winningOutcome = dispute.outcome === Vote.FREELANCER ? "YES" : "NO";
                            break;
                        default:
                            status = "EXPIRED";
                    }

                    const votingStartTime = Number(dispute.votingStartTime);
                    const votingEndTime = Number(dispute.votingEndTime);

                    const yesTotalEth = formatEth(dispute.totalStakedForFreelancer);
                    const noTotalEth = formatEth(dispute.totalStakedForClient);

                    // Simple weighted calculation (for real implementation would need block timestamps)
                    const yesWeighted = yesTotalEth;
                    const noWeighted = noTotalEth;

                    const totalWeighted = parseFloat(yesWeighted) + parseFloat(noWeighted);
                    const yesPercent = totalWeighted > 0
                        ? Math.round((parseFloat(yesWeighted) / totalWeighted) * 100)
                        : 50;
                    const noPercent = 100 - yesPercent;

                    const marketData: DisputeMarketData = {
                        id: marketId,
                        escrowAddress: dispute.escrowContract,
                        question: "Was the milestone completed as specified?",
                        status,
                        createdAt: new Date(votingStartTime * 1000),
                        deadline: new Date(votingEndTime * 1000),
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
                        clientBond: formatEth(dispute.clientBond),
                        freelancerBond: formatEth(dispute.freelancerBond),
                        winningOutcome,
                    };

                    setMarket(marketData);
                    setIsContractData(true);
                    console.log("Loaded dispute market from contract:", marketData);
                    return;
                } catch (contractError) {
                    console.warn("Failed to fetch dispute from contract, falling back to mock:", contractError);
                }
            }

            // Fallback to mock data
            console.log("Using mock dispute market data for:", marketId);
            const mockMarket = generateMockMarket(marketId);
            setMarket(mockMarket);
            setIsContractData(false);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch market");
        } finally {
            setIsLoading(false);
        }
    }, [marketId, getProvider, isConnected, isCorrectNetwork]);

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
        const percentRemaining = Math.max(0, timeRemaining / totalDuration);

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

        const provider = getProvider();
        if (!provider || !isConnected || !isCorrectNetwork) {
            setError("Wallet not connected or wrong network");
            return;
        }

        setIsDepositing(true);
        try {
            const disputeId = parseInt(marketId, 10);

            if (!isNaN(disputeId) && isContractData) {
                // Real contract vote
                const disputeModule = await getDisputeModule(provider);
                const vote = selectedOutcome === "YES" ? Vote.FREELANCER : Vote.CLIENT;
                const tx = await disputeModule.vote(disputeId, vote, {
                    value: ethers.parseEther(depositAmount)
                });
                console.log("Vote transaction submitted:", tx.hash);
                await tx.wait();
                console.log("Vote confirmed!");
            } else {
                // Mock deposit
                await new Promise((r) => setTimeout(r, 2000));
            }

            // Reset form
            setDepositAmount("");
            setSelectedOutcome(null);
            await fetchMarket();
        } catch (err) {
            console.error("Deposit failed:", err);
            setError(err instanceof Error ? err.message : "Deposit failed");
        } finally {
            setIsDepositing(false);
        }
    }, [depositAmount, selectedOutcome, fetchMarket, getProvider, isConnected, isCorrectNetwork, marketId, isContractData]);

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
        isContractData,
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
