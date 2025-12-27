"use client";

import { useState, useCallback } from "react";
import { BrowserProvider } from "ethers";
import * as contracts from "@/lib/contracts";

export interface UseEscrowReturn {
    // State
    isConnected: boolean;
    address: string | null;
    isLoading: boolean;
    error: string | null;

    // Connection
    connect: () => Promise<void>;
    disconnect: () => void;

    // Escrow Actions
    fundEscrow: (escrowAddress: string, milestoneEth: string) => Promise<string>;
    submitWork: (escrowAddress: string, evidenceHash: string) => Promise<string>;
    approveWork: (escrowAddress: string) => Promise<string>;
    getEscrowDetails: (escrowAddress: string) => Promise<contracts.EscrowDetails>;

    // Dispute Actions
    openDispute: (escrowAddress: string) => Promise<string>;
    postBond: (disputeId: number, bondEth: string) => Promise<string>;
    vote: (disputeId: number, vote: contracts.Vote, stakeEth: string) => Promise<string>;
    resolveDispute: (disputeId: number) => Promise<string>;
    claimRewards: (disputeId: number) => Promise<string>;
    getDisputeDetails: (disputeId: number) => Promise<contracts.DisputeDetails>;
}

export function useEscrow(): UseEscrowReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);

    const connect = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (typeof window === "undefined" || !window.ethereum) {
                throw new Error("Please install MetaMask or another Web3 wallet");
            }

            const browserProvider = new BrowserProvider(window.ethereum);
            await browserProvider.send("eth_requestAccounts", []);

            const signer = await browserProvider.getSigner();
            const userAddress = await signer.getAddress();

            setProvider(browserProvider);
            setAddress(userAddress);
            setIsConnected(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to connect wallet");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        setProvider(null);
        setAddress(null);
        setIsConnected(false);
    }, []);

    const withProvider = useCallback(async <T,>(
        action: (provider: BrowserProvider) => Promise<T>
    ): Promise<T> => {
        if (!provider) {
            throw new Error("Wallet not connected");
        }
        setIsLoading(true);
        setError(null);

        try {
            return await action(provider);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Transaction failed";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [provider]);

    const fundEscrow = useCallback(async (escrowAddress: string, milestoneEth: string) => {
        return withProvider(async (p) => {
            const tx = await contracts.fundEscrow(p, escrowAddress, milestoneEth);
            await tx.wait();
            return tx.hash;
        });
    }, [withProvider]);

    const submitWork = useCallback(async (escrowAddress: string, evidenceHash: string) => {
        return withProvider(async (p) => {
            const tx = await contracts.submitWork(p, escrowAddress, evidenceHash);
            await tx.wait();
            return tx.hash;
        });
    }, [withProvider]);

    const approveWork = useCallback(async (escrowAddress: string) => {
        return withProvider(async (p) => {
            const tx = await contracts.approveWork(p, escrowAddress);
            await tx.wait();
            return tx.hash;
        });
    }, [withProvider]);

    const getEscrowDetails = useCallback(async (escrowAddress: string) => {
        return withProvider(async (p) => {
            return contracts.getEscrowDetails(p, escrowAddress);
        });
    }, [withProvider]);

    const openDispute = useCallback(async (escrowAddress: string) => {
        return withProvider(async (p) => {
            const tx = await contracts.openDispute(p, escrowAddress);
            await tx.wait();
            return tx.hash;
        });
    }, [withProvider]);

    const postBond = useCallback(async (disputeId: number, bondEth: string) => {
        return withProvider(async (p) => {
            const tx = await contracts.postBond(p, disputeId, bondEth);
            await tx.wait();
            return tx.hash;
        });
    }, [withProvider]);

    const vote = useCallback(async (disputeId: number, voteChoice: contracts.Vote, stakeEth: string) => {
        return withProvider(async (p) => {
            const tx = await contracts.voteOnDispute(p, disputeId, voteChoice, stakeEth);
            await tx.wait();
            return tx.hash;
        });
    }, [withProvider]);

    const resolveDispute = useCallback(async (disputeId: number) => {
        return withProvider(async (p) => {
            const tx = await contracts.resolveDispute(p, disputeId);
            await tx.wait();
            return tx.hash;
        });
    }, [withProvider]);

    const claimRewards = useCallback(async (disputeId: number) => {
        return withProvider(async (p) => {
            const tx = await contracts.claimRewards(p, disputeId);
            await tx.wait();
            return tx.hash;
        });
    }, [withProvider]);

    const getDisputeDetails = useCallback(async (disputeId: number) => {
        return withProvider(async (p) => {
            return contracts.getDisputeDetails(p, disputeId);
        });
    }, [withProvider]);

    return {
        isConnected,
        address,
        isLoading,
        error,
        connect,
        disconnect,
        fundEscrow,
        submitWork,
        approveWork,
        getEscrowDetails,
        openDispute,
        postBond,
        vote,
        resolveDispute,
        claimRewards,
        getDisputeDetails,
    };
}

// Add ethereum type to window
declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            on: (event: string, callback: (...args: unknown[]) => void) => void;
            removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
        };
    }
}
