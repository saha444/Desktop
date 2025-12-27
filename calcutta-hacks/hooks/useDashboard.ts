"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./useWallet";

export type EscrowStatus =
    | "AWAITING_FUNDING"
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "DISPUTE_OPEN"
    | "RESOLVED";

export type UserRole = "client" | "freelancer";

export interface EscrowItem {
    id: string;
    address: string;
    role: UserRole;
    counterparty: string;
    milestoneValue: string; // ETH
    status: EscrowStatus;
    deadline: Date | null;
    createdAt: Date;
}

export type VoteOutcome = "FREELANCER" | "CLIENT";

export interface DisputeMarket {
    id: string;
    escrowId: string;
    escrowAddress: string;
    yourVote: VoteOutcome;
    yourStake: string; // ETH
    totalForFreelancer: string; // ETH
    totalForClient: string; // ETH
    votingEndsAt: Date;
    isResolved: boolean;
}

export interface UseDashboardReturn {
    escrows: EscrowItem[];
    disputeMarkets: DisputeMarket[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

// Mock data for demo - in production, this would query blockchain events or a subgraph
const MOCK_ESCROWS: EscrowItem[] = [
    {
        id: "1",
        address: "0x1234567890abcdef1234567890abcdef12345678",
        role: "client",
        counterparty: "0xabcdef1234567890abcdef1234567890abcdef12",
        milestoneValue: "0.5",
        status: "IN_PROGRESS",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
        id: "2",
        address: "0x2345678901bcdef12345678901bcdef123456789",
        role: "freelancer",
        counterparty: "0xbcdef12345678901bcdef12345678901bcdef123",
        milestoneValue: "1.2",
        status: "SUBMITTED",
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
        id: "3",
        address: "0x3456789012cdef123456789012cdef1234567890",
        role: "client",
        counterparty: "0xcdef123456789012cdef123456789012cdef1234",
        milestoneValue: "0.25",
        status: "AWAITING_FUNDING",
        deadline: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
        id: "4",
        address: "0x456789013def1234567890123def12345678901a",
        role: "freelancer",
        counterparty: "0xdef1234567890123def1234567890123def12345",
        milestoneValue: "2.0",
        status: "DISPUTE_OPEN",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days for voting
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
        id: "5",
        address: "0x56789014ef12345678901234ef123456789012ab",
        role: "client",
        counterparty: "0xef12345678901234ef12345678901234ef123456",
        milestoneValue: "0.75",
        status: "RESOLVED",
        deadline: null,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
];

// Mock dispute markets for public participants
const MOCK_DISPUTE_MARKETS: DisputeMarket[] = [
    {
        id: "1",
        escrowId: "101",
        escrowAddress: "0xabc123def456789abc123def456789abc123def4",
        yourVote: "FREELANCER",
        yourStake: "0.1",
        totalForFreelancer: "2.5",
        totalForClient: "1.8",
        votingEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        isResolved: false,
    },
    {
        id: "2",
        escrowId: "102",
        escrowAddress: "0xdef456789abc123def456789abc123def456789a",
        yourVote: "CLIENT",
        yourStake: "0.25",
        totalForFreelancer: "1.2",
        totalForClient: "3.1",
        votingEndsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        isResolved: false,
    },
    {
        id: "3",
        escrowId: "103",
        escrowAddress: "0x789abc123def456789abc123def456789abc123d",
        yourVote: "FREELANCER",
        yourStake: "0.5",
        totalForFreelancer: "4.2",
        totalForClient: "2.0",
        votingEndsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // ended
        isResolved: true,
    },
];

export function useDashboard(): UseDashboardReturn {
    const { isConnected, address } = useWallet();
    const [escrows, setEscrows] = useState<EscrowItem[]>([]);
    const [disputeMarkets, setDisputeMarkets] = useState<DisputeMarket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!isConnected || !address) {
            setEscrows([]);
            setDisputeMarkets([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // TODO: In production, query blockchain events or subgraph
            // For now, return mock data with simulated delay
            await new Promise(resolve => setTimeout(resolve, 500));
            setEscrows(MOCK_ESCROWS);
            setDisputeMarkets(MOCK_DISPUTE_MARKETS);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, address]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        escrows,
        disputeMarkets,
        isLoading,
        error,
        refresh: fetchData,
    };
}

// Helper functions
export function getStatusLabel(status: EscrowStatus): string {
    const labels: Record<EscrowStatus, string> = {
        AWAITING_FUNDING: "Awaiting Funding",
        IN_PROGRESS: "In Progress",
        SUBMITTED: "Submitted",
        DISPUTE_OPEN: "Dispute Open",
        RESOLVED: "Resolved",
    };
    return labels[status];
}

export function getStatusColor(status: EscrowStatus): string {
    const colors: Record<EscrowStatus, string> = {
        AWAITING_FUNDING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        IN_PROGRESS: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        SUBMITTED: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        DISPUTE_OPEN: "bg-red-500/20 text-red-300 border-red-500/30",
        RESOLVED: "bg-green-500/20 text-green-300 border-green-500/30",
    };
    return colors[status];
}

export function getRoleColor(role: UserRole): string {
    return role === "client"
        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
        : "bg-orange-500/20 text-orange-300 border-orange-500/30";
}

export function formatTimeLeft(deadline: Date | null): string {
    if (!deadline) return "—";

    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
}

export function truncateAddress(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
