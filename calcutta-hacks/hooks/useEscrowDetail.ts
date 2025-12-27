"use client"

import { useState, useEffect, useCallback } from "react"

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

// Generate mock escrow data based on address
function generateMockEscrow(address: string): EscrowDetail {
    const addressNum = parseInt(address.slice(2, 10), 16)
    const now = Date.now()

    // Determine state based on address
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

    // Determine funded and submitted dates based on state
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

export function useEscrowDetail(address: string): UseEscrowDetailReturn {
    const [escrow, setEscrow] = useState<EscrowDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<"client" | "freelancer" | "observer" | null>(null)

    const fetchEscrow = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 800))

            // Validate address
            if (!address || !address.startsWith("0x") || address.length !== 42) {
                throw new Error("Invalid escrow address")
            }

            // Generate mock data
            const mockEscrow = generateMockEscrow(address)
            setEscrow(mockEscrow)

            // Randomly assign user role for demo
            const roles: ("client" | "freelancer" | "observer")[] = ["client", "freelancer", "observer"]
            const addressNum = parseInt(address.slice(2, 10), 16)
            setUserRole(roles[addressNum % 3])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load escrow")
            setEscrow(null)
        } finally {
            setIsLoading(false)
        }
    }, [address])

    useEffect(() => {
        fetchEscrow()
    }, [fetchEscrow])

    return {
        escrow,
        isLoading,
        error,
        userRole,
        refresh: fetchEscrow,
    }
}
