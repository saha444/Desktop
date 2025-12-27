"use client";

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";
import { useWallet } from "./useWallet";
import {
    getEscrowDetails,
    formatEth,
    EscrowState as ContractEscrowState,
} from "@/lib/contracts";

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
    addEscrow: (address: string, role: UserRole, counterparty: string, milestoneValue: string) => void;
}

// LocalStorage key for storing user's escrow addresses
const ESCROWS_STORAGE_KEY = "paycheck_escrows";

// Get stored escrow addresses from localStorage
function getStoredEscrows(): { address: string; role: UserRole; counterparty: string; milestoneValue: string; createdAt: string }[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(ESCROWS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Save escrow addresses to localStorage
function saveStoredEscrows(escrows: { address: string; role: UserRole; counterparty: string; milestoneValue: string; createdAt: string }[]) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(ESCROWS_STORAGE_KEY, JSON.stringify(escrows));
    } catch (e) {
        console.error("Failed to save escrows to localStorage:", e);
    }
}

// Map contract state to UI status
function mapContractState(state: number): EscrowStatus {
    switch (state) {
        case ContractEscrowState.CREATED:
            return "AWAITING_FUNDING";
        case ContractEscrowState.FUNDED:
            return "IN_PROGRESS";
        case ContractEscrowState.SUBMITTED:
            return "SUBMITTED";
        case ContractEscrowState.DISPUTE_OPEN:
        case ContractEscrowState.DISPUTE_ACTIVE:
            return "DISPUTE_OPEN";
        case ContractEscrowState.APPROVED:
        case ContractEscrowState.RESOLVED:
            return "RESOLVED";
        default:
            return "AWAITING_FUNDING";
    }
}

// Mock dispute markets (these would come from subgraph in production)
const MOCK_DISPUTE_MARKETS: DisputeMarket[] = [
    {
        id: "1",
        escrowId: "101",
        escrowAddress: "0xabc123def456789abc123def456789abc123def4",
        yourVote: "FREELANCER",
        yourStake: "0.1",
        totalForFreelancer: "2.5",
        totalForClient: "1.8",
        votingEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        isResolved: false,
    },
];

export function useDashboard(): UseDashboardReturn {
    const { isConnected, address } = useWallet();
    const [escrows, setEscrows] = useState<EscrowItem[]>([]);
    const [disputeMarkets, setDisputeMarkets] = useState<DisputeMarket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getProvider = useCallback((): BrowserProvider | null => {
        if (typeof window === "undefined" || !window.ethereum) {
            return null;
        }
        return new BrowserProvider(window.ethereum);
    }, []);

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
            const storedEscrows = getStoredEscrows();
            const provider = getProvider();
            const loadedEscrows: EscrowItem[] = [];

            // Fetch current state for each stored escrow
            for (const stored of storedEscrows) {
                try {
                    let status: EscrowStatus = "AWAITING_FUNDING";
                    let counterparty = stored.counterparty;
                    let milestoneValue = stored.milestoneValue;

                    // Try to fetch real data from contract
                    if (provider) {
                        try {
                            const details = await getEscrowDetails(provider, stored.address);
                            status = mapContractState(details.state);
                            milestoneValue = formatEth(details.milestoneValue);

                            // Update counterparty based on role
                            if (stored.role === "client") {
                                counterparty = details.freelancer;
                            } else {
                                counterparty = details.client;
                            }
                        } catch (contractErr) {
                            console.warn(`Could not fetch contract data for ${stored.address}:`, contractErr);
                        }
                    }

                    loadedEscrows.push({
                        id: stored.address.slice(-8),
                        address: stored.address,
                        role: stored.role,
                        counterparty,
                        milestoneValue,
                        status,
                        deadline: null, // Would need to be stored or fetched
                        createdAt: new Date(stored.createdAt),
                    });
                } catch (err) {
                    console.error(`Error loading escrow ${stored.address}:`, err);
                }
            }

            setEscrows(loadedEscrows);
            setDisputeMarkets(MOCK_DISPUTE_MARKETS);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, address, getProvider]);

    // Add a new escrow to localStorage
    const addEscrow = useCallback((
        escrowAddress: string,
        role: UserRole,
        counterparty: string,
        milestoneValue: string
    ) => {
        const stored = getStoredEscrows();

        // Check if already exists
        if (stored.some(e => e.address.toLowerCase() === escrowAddress.toLowerCase())) {
            console.log("Escrow already tracked:", escrowAddress);
            return;
        }

        stored.push({
            address: escrowAddress,
            role,
            counterparty,
            milestoneValue,
            createdAt: new Date().toISOString(),
        });

        saveStoredEscrows(stored);
        console.log("Added escrow to tracking:", escrowAddress);

        // Refresh the list
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        escrows,
        disputeMarkets,
        isLoading,
        error,
        refresh: fetchData,
        addEscrow,
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
