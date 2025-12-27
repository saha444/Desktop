"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./useWallet";

export type EscrowState =
    | "AWAITING_FUNDING"
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "APPROVED"
    | "DISPUTE_OPEN"
    | "DISPUTE_ACTIVE"
    | "RESOLVED";

export interface EscrowDetailData {
    address: string;
    client: string;
    freelancer: string;
    milestoneValue: string; // ETH
    bondValue: string; // ETH (30% of milestone)
    deadline: Date;
    createdAt: Date;
    fundedAt: Date | null;
    submittedAt: Date | null;
    state: EscrowState;
    evidenceHash: string | null;
    disputeId: number | null;
}

export interface UseEscrowDetailReturn {
    escrow: EscrowDetailData | null;
    isLoading: boolean;
    error: string | null;
    userRole: "client" | "freelancer" | "observer" | null;
    refresh: () => Promise<void>;
}

// Mock escrow data generator based on address
function generateMockEscrow(address: string): EscrowDetailData {
    // Use address to deterministically generate mock data
    const addressNum = parseInt(address.slice(2, 10), 16);
    const stateIndex = addressNum % 7;
    const states: EscrowState[] = [
        "AWAITING_FUNDING",
        "IN_PROGRESS",
        "SUBMITTED",
        "APPROVED",
        "DISPUTE_OPEN",
        "DISPUTE_ACTIVE",
        "RESOLVED",
    ];

    const milestoneValue = ((addressNum % 50) / 10 + 0.5).toFixed(2);
    const bondValue = (parseFloat(milestoneValue) * 0.3).toFixed(3);

    const now = Date.now();
    const createdAt = new Date(now - (addressNum % 14) * 24 * 60 * 60 * 1000);
    const deadline = new Date(now + ((addressNum % 14) + 1) * 24 * 60 * 60 * 1000);

    let fundedAt: Date | null = null;
    let submittedAt: Date | null = null;

    if (stateIndex >= 1) {
        fundedAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    }
    if (stateIndex >= 2) {
        submittedAt = new Date(fundedAt!.getTime() + 3 * 24 * 60 * 60 * 1000);
    }

    return {
        address,
        client: "0x" + "c".repeat(40).slice(0, 38) + address.slice(-2),
        freelancer: "0x" + "f".repeat(40).slice(0, 38) + address.slice(-2),
        milestoneValue,
        bondValue,
        deadline,
        createdAt,
        fundedAt,
        submittedAt,
        state: states[stateIndex],
        evidenceHash: stateIndex >= 2 ? "QmX..." + address.slice(-8) : null,
        disputeId: stateIndex >= 4 ? addressNum % 100 : null,
    };
}

export function useEscrowDetail(escrowAddress: string): UseEscrowDetailReturn {
    const { address: userAddress, isConnected } = useWallet();
    const [escrow, setEscrow] = useState<EscrowDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEscrow = useCallback(async () => {
        if (!escrowAddress) {
            setError("No escrow address provided");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Generate mock data
            const mockEscrow = generateMockEscrow(escrowAddress);
            setEscrow(mockEscrow);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch escrow details");
        } finally {
            setIsLoading(false);
        }
    }, [escrowAddress]);

    useEffect(() => {
        fetchEscrow();
    }, [fetchEscrow]);

    // Determine user role
    const userRole = (() => {
        if (!isConnected || !userAddress || !escrow) return null;
        const lowerUser = userAddress.toLowerCase();
        if (escrow.client.toLowerCase() === lowerUser) return "client";
        if (escrow.freelancer.toLowerCase() === lowerUser) return "freelancer";
        return "observer";
    })();

    return {
        escrow,
        isLoading,
        error,
        userRole,
        refresh: fetchEscrow,
    };
}

// Helper functions
export function getStateLabel(state: EscrowState): string {
    const labels: Record<EscrowState, string> = {
        AWAITING_FUNDING: "Awaiting Funding",
        IN_PROGRESS: "In Progress",
        SUBMITTED: "Work Submitted",
        APPROVED: "Approved",
        DISPUTE_OPEN: "Dispute Open",
        DISPUTE_ACTIVE: "Dispute Active",
        RESOLVED: "Resolved",
    };
    return labels[state];
}

export function getStateColor(state: EscrowState): string {
    const colors: Record<EscrowState, string> = {
        AWAITING_FUNDING: "border-yellow-500/30 bg-yellow-500/20 text-yellow-300",
        IN_PROGRESS: "border-blue-500/30 bg-blue-500/20 text-blue-300",
        SUBMITTED: "border-purple-500/30 bg-purple-500/20 text-purple-300",
        APPROVED: "border-green-500/30 bg-green-500/20 text-green-300",
        DISPUTE_OPEN: "border-red-500/30 bg-red-500/20 text-red-300",
        DISPUTE_ACTIVE: "border-orange-500/30 bg-orange-500/20 text-orange-300",
        RESOLVED: "border-gray-500/30 bg-gray-500/20 text-gray-300",
    };
    return colors[state];
}

export function formatTimeRemaining(deadline: Date): string {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
}

export function truncateAddress(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
