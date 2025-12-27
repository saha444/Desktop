"use client"

import { useState, useEffect, useCallback } from "react"
import { BrowserProvider, ethers } from "ethers"
import { useWallet } from "./useWallet"
import {
    getEscrowDetails,
    getEscrowContract,
    EscrowState as ContractEscrowState,
    formatEth,
} from "@/lib/contracts"

// Escrow states matching smart contract
export type EscrowState =
    | "AWAITING_FUNDING"
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "DISPUTE_OPEN"
    | "RESOLVED"

export interface EscrowDetail {
    address: string
    client: string
    freelancer: string
    milestoneValue: string
    bondValue: string
    deadline: Date
    state: EscrowState
    evidenceHash?: string
    description: string
    createdAt: Date
    fundedAt?: Date
    submittedAt?: Date
}

export interface UseEscrowDetailReturn {
    escrow: EscrowDetail | null
    isLoading: boolean
    error: string | null
    userRole: "client" | "freelancer" | "observer" | null
    refresh: () => void
    // Contract actions
    fundEscrow: () => Promise<string | null>
    submitWork: (evidenceHash: string) => Promise<string | null>
    approveWork: () => Promise<string | null>
    openDispute: () => Promise<string | null>
    isActionLoading: boolean
    actionError: string | null
    isContractData: boolean
}

// Helper functions
export function getStateLabel(state: EscrowState): string {
    const labels: Record<EscrowState, string> = {
        AWAITING_FUNDING: "Awaiting Funding",
        IN_PROGRESS: "In Progress",
        SUBMITTED: "Submitted",
        DISPUTE_OPEN: "Dispute Open",
        RESOLVED: "Resolved",
    }
    return labels[state]
}

export function getStateColor(state: EscrowState): string {
    const colors: Record<EscrowState, string> = {
        AWAITING_FUNDING: "border-yellow-500/30 bg-yellow-500/20 text-yellow-300",
        IN_PROGRESS: "border-blue-500/30 bg-blue-500/20 text-blue-300",
        SUBMITTED: "border-purple-500/30 bg-purple-500/20 text-purple-300",
        DISPUTE_OPEN: "border-red-500/30 bg-red-500/20 text-red-300",
        RESOLVED: "border-gray-500/30 bg-gray-500/20 text-gray-300",
    }
    return colors[state]
}

export function formatTimeRemaining(deadline: Date): string {
    const now = Date.now()
    const diff = deadline.getTime() - now

    if (diff <= 0) return "Expired"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h remaining`

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${minutes}m remaining`
}

export function truncateAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Map contract state enum to UI state string
function mapContractState(state: number): EscrowState {
    switch (state) {
        case ContractEscrowState.CREATED:
            return "AWAITING_FUNDING"
        case ContractEscrowState.FUNDED:
            return "IN_PROGRESS"
        case ContractEscrowState.SUBMITTED:
            return "SUBMITTED"
        case ContractEscrowState.DISPUTE_OPEN:
        case ContractEscrowState.DISPUTE_ACTIVE:
            return "DISPUTE_OPEN"
        case ContractEscrowState.APPROVED:
        case ContractEscrowState.RESOLVED:
            return "RESOLVED"
        default:
            return "AWAITING_FUNDING"
    }
}

// Generate mock escrow data as fallback
function generateMockEscrow(address: string): EscrowDetail {
    const addressNum = parseInt(address.slice(2, 10), 16)
    const now = Date.now()

    const states: EscrowState[] = [
        "AWAITING_FUNDING",
        "IN_PROGRESS",
        "SUBMITTED",
        "DISPUTE_OPEN",
        "RESOLVED",
    ]
    const state = states[addressNum % 5]

    const milestoneValue = ((addressNum % 50) / 10 + 0.5).toFixed(2)
    const bondValue = (parseFloat(milestoneValue) * 0.3).toFixed(3)

    const fundedAt = state !== "AWAITING_FUNDING"
        ? new Date(now - 5 * 24 * 60 * 60 * 1000)
        : undefined
    const submittedAt = state === "SUBMITTED" || state === "DISPUTE_OPEN" || state === "RESOLVED"
        ? new Date(now - 2 * 24 * 60 * 60 * 1000)
        : undefined

    return {
        address,
        client: "0x" + "c".repeat(40).slice(0, 38) + address.slice(-2),
        freelancer: "0x" + "f".repeat(40).slice(0, 38) + address.slice(-2),
        milestoneValue,
        bondValue,
        deadline: new Date(now + (addressNum % 7 + 1) * 24 * 60 * 60 * 1000),
        state,
        evidenceHash: state === "SUBMITTED" || state === "DISPUTE_OPEN" || state === "RESOLVED"
            ? "Qm" + "x".repeat(44).slice(0, 42) + address.slice(-4)
            : undefined,
        description: "Complete the frontend implementation for the escrow dashboard with milestone tracking and dispute resolution features.",
        createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
        fundedAt,
        submittedAt,
    }
}

export function useEscrowDetail(escrowAddress: string): UseEscrowDetailReturn {
    const { isConnected, address: walletAddress, isCorrectNetwork } = useWallet()
    const [escrow, setEscrow] = useState<EscrowDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<"client" | "freelancer" | "observer" | null>(null)
    const [isContractData, setIsContractData] = useState(false)

    // Action states
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)

    const getProvider = useCallback((): BrowserProvider | null => {
        if (typeof window === "undefined" || !window.ethereum) {
            return null
        }
        return new BrowserProvider(window.ethereum)
    }, [])

    const fetchEscrow = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Validate address
            if (!escrowAddress || !escrowAddress.startsWith("0x") || escrowAddress.length !== 42) {
                throw new Error("Invalid escrow address")
            }

            const provider = getProvider()

            // Try to fetch from contract if connected
            if (provider && isConnected && isCorrectNetwork) {
                try {
                    console.log("Fetching escrow details from contract:", escrowAddress)
                    const details = await getEscrowDetails(provider, escrowAddress)

                    const now = Date.now()
                    const createdAt = Number(details.createdAt) * 1000
                    const fundedAt = Number(details.fundedAt) > 0 ? Number(details.fundedAt) * 1000 : undefined
                    const submittedAt = Number(details.submittedAt) > 0 ? Number(details.submittedAt) * 1000 : undefined

                    const escrowData: EscrowDetail = {
                        address: escrowAddress,
                        client: details.client,
                        freelancer: details.freelancer,
                        milestoneValue: formatEth(details.milestoneValue),
                        bondValue: formatEth(details.bondValue),
                        deadline: new Date(now + 7 * 24 * 60 * 60 * 1000), // Default 7 days, adjust as needed
                        state: mapContractState(details.state),
                        evidenceHash: details.evidenceHash !== "0x0000000000000000000000000000000000000000000000000000000000000000"
                            ? details.evidenceHash
                            : undefined,
                        description: "Escrow contract milestone",
                        createdAt: new Date(createdAt),
                        fundedAt: fundedAt ? new Date(fundedAt) : undefined,
                        submittedAt: submittedAt ? new Date(submittedAt) : undefined,
                    }

                    setEscrow(escrowData)
                    setIsContractData(true)

                    // Determine user role
                    if (walletAddress) {
                        const lowerWallet = walletAddress.toLowerCase()
                        if (details.client.toLowerCase() === lowerWallet) {
                            setUserRole("client")
                        } else if (details.freelancer.toLowerCase() === lowerWallet) {
                            setUserRole("freelancer")
                        } else {
                            setUserRole("observer")
                        }
                    }

                    console.log("Loaded escrow from contract:", escrowData)
                    return
                } catch (contractError) {
                    console.warn("Failed to fetch from contract, using mock data:", contractError)
                }
            }

            // Fallback to mock data
            console.log("Using mock escrow data for:", escrowAddress)
            const mockEscrow = generateMockEscrow(escrowAddress)
            setEscrow(mockEscrow)
            setIsContractData(false)

            // Mock role assignment
            const roles: ("client" | "freelancer" | "observer")[] = ["client", "freelancer", "observer"]
            const addressNum = parseInt(escrowAddress.slice(2, 10), 16)
            setUserRole(roles[addressNum % 3])

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load escrow")
            setEscrow(null)
        } finally {
            setIsLoading(false)
        }
    }, [escrowAddress, getProvider, isConnected, isCorrectNetwork, walletAddress])

    useEffect(() => {
        fetchEscrow()
    }, [fetchEscrow])

    // Contract action: Fund escrow
    const fundEscrow = useCallback(async (): Promise<string | null> => {
        console.log("===== FUND ESCROW CALLED =====");
        console.log("Escrow:", escrow?.address);
        console.log("Is connected:", isConnected);
        console.log("Is correct network:", isCorrectNetwork);
        console.log("Is contract data:", isContractData);

        if (!escrow || !isConnected || !isCorrectNetwork) {
            const errorMsg = "Wallet not connected or wrong network";
            console.error(errorMsg);
            setActionError(errorMsg);
            return null;
        }

        setIsActionLoading(true);
        setActionError(null);

        try {
            const provider = getProvider();
            console.log("Provider:", provider);
            if (!provider) throw new Error("No provider available");

            if (isContractData) {
                console.log("Using REAL contract call");
                const signer = await provider.getSigner();
                console.log("Signer:", await signer.getAddress());

                const contract = getEscrowContract(escrowAddress, signer);
                console.log("Contract instance created for:", escrowAddress);
                console.log("Calling fund() with value:", escrow.milestoneValue, "ETH");

                const tx = await contract.fund({ value: ethers.parseEther(escrow.milestoneValue) });
                console.log("Fund transaction submitted:", tx.hash);
                await tx.wait();
                console.log("Fund transaction confirmed!");
                await fetchEscrow();
                return tx.hash;
            } else {
                console.log("Using MOCK action (no contract data)");
                // Mock action
                await new Promise(r => setTimeout(r, 2000));
                await fetchEscrow();
                return "0x" + "mock".repeat(16);
            }
        } catch (err) {
            console.error("Fund escrow failed:", err);
            setActionError(err instanceof Error ? err.message : "Failed to fund escrow");
            return null;
        } finally {
            setIsActionLoading(false);
        }
    }, [escrow, isConnected, isCorrectNetwork, getProvider, isContractData, escrowAddress, fetchEscrow]);

    // Contract action: Submit work
    const submitWork = useCallback(async (evidenceHash: string): Promise<string | null> => {
        if (!escrow || !isConnected || !isCorrectNetwork) {
            setActionError("Wallet not connected or wrong network")
            return null
        }

        setIsActionLoading(true)
        setActionError(null)

        try {
            const provider = getProvider()
            if (!provider) throw new Error("No provider available")

            if (isContractData) {
                const signer = await provider.getSigner()
                const contract = getEscrowContract(escrowAddress, signer)
                // Convert string to bytes32
                const hashBytes = ethers.encodeBytes32String(evidenceHash.slice(0, 31))
                const tx = await contract.submit(hashBytes)
                console.log("Submit transaction submitted:", tx.hash)
                await tx.wait()
                console.log("Submit transaction confirmed!")
                await fetchEscrow()
                return tx.hash
            } else {
                // Mock action
                await new Promise(r => setTimeout(r, 2000))
                await fetchEscrow()
                return "0x" + "mock".repeat(16)
            }
        } catch (err) {
            console.error("Submit work failed:", err)
            setActionError(err instanceof Error ? err.message : "Failed to submit work")
            return null
        } finally {
            setIsActionLoading(false)
        }
    }, [escrow, isConnected, isCorrectNetwork, getProvider, isContractData, escrowAddress, fetchEscrow])

    // Contract action: Approve work
    const approveWork = useCallback(async (): Promise<string | null> => {
        if (!escrow || !isConnected || !isCorrectNetwork) {
            setActionError("Wallet not connected or wrong network")
            return null
        }

        setIsActionLoading(true)
        setActionError(null)

        try {
            const provider = getProvider()
            if (!provider) throw new Error("No provider available")

            if (isContractData) {
                const signer = await provider.getSigner()
                const contract = getEscrowContract(escrowAddress, signer)
                const tx = await contract.approve()
                console.log("Approve transaction submitted:", tx.hash)
                await tx.wait()
                console.log("Approve transaction confirmed!")
                await fetchEscrow()
                return tx.hash
            } else {
                // Mock action
                await new Promise(r => setTimeout(r, 2000))
                await fetchEscrow()
                return "0x" + "mock".repeat(16)
            }
        } catch (err) {
            console.error("Approve work failed:", err)
            setActionError(err instanceof Error ? err.message : "Failed to approve work")
            return null
        } finally {
            setIsActionLoading(false)
        }
    }, [escrow, isConnected, isCorrectNetwork, getProvider, isContractData, escrowAddress, fetchEscrow])

    // Contract action: Open dispute
    const openDispute = useCallback(async (): Promise<string | null> => {
        if (!escrow || !isConnected || !isCorrectNetwork) {
            setActionError("Wallet not connected or wrong network")
            return null
        }

        setIsActionLoading(true)
        setActionError(null)

        try {
            const provider = getProvider()
            if (!provider) throw new Error("No provider available")

            if (isContractData) {
                const signer = await provider.getSigner()
                const contract = getEscrowContract(escrowAddress, signer)
                const tx = await contract.openDispute()
                console.log("Open dispute transaction submitted:", tx.hash)
                await tx.wait()
                console.log("Open dispute transaction confirmed!")
                await fetchEscrow()
                return tx.hash
            } else {
                // Mock action
                await new Promise(r => setTimeout(r, 2000))
                await fetchEscrow()
                return "0x" + "mock".repeat(16)
            }
        } catch (err) {
            console.error("Open dispute failed:", err)
            setActionError(err instanceof Error ? err.message : "Failed to open dispute")
            return null
        } finally {
            setIsActionLoading(false)
        }
    }, [escrow, isConnected, isCorrectNetwork, getProvider, isContractData, escrowAddress, fetchEscrow])

    return {
        escrow,
        isLoading,
        error,
        userRole,
        refresh: fetchEscrow,
        // Actions
        fundEscrow,
        submitWork,
        approveWork,
        openDispute,
        isActionLoading,
        actionError,
        isContractData,
    }
}
