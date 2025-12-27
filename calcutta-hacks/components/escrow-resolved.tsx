"use client"

import { useRouter } from "next/navigation"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { useWallet } from "@/hooks/useWallet"
import {
    useEscrowDetail,
    getStateLabel,
    truncateAddress,
} from "@/hooks/useEscrowDetail"
import {
    ArrowLeft,
    Loader2,
    AlertTriangle,
    Copy,
    CheckCircle2,
    Clock,
    Wallet,
    Users,
    Briefcase,
    Shield,
    ExternalLink,
    Lock,
    FileText,
    Scale,
    Trophy,
    ThumbsUp,
    ThumbsDown,
    History,
    Receipt,
    Link as LinkIcon,
    ArrowUpRight,
    ArrowDownLeft,
    Hash,
} from "lucide-react"
import { useState, useEffect } from "react"

interface EscrowResolvedProps {
    address: string
}

// Mock transaction data for resolved escrow
interface TransactionRecord {
    id: string
    type: "FUNDED" | "SUBMITTED" | "DISPUTED" | "RESOLVED" | "PAYOUT"
    txHash: string
    timestamp: Date
    description: string
    amount?: string
    from?: string
    to?: string
}

interface PayoutRecord {
    recipient: string
    recipientLabel: string
    amount: string
    type: "PRINCIPAL" | "BOND" | "WINNINGS" | "PROTOCOL_FEE"
    txHash: string
}

function generateMockResolutionData(address: string) {
    const addressNum = parseInt(address.slice(2, 10), 16)
    const now = Date.now()

    // Outcome based on address
    const winningOutcome: "YES" | "NO" = addressNum % 2 === 0 ? "YES" : "NO"
    const winner: "freelancer" | "client" = winningOutcome === "YES" ? "freelancer" : "client"

    const milestoneValue = ((addressNum % 50) / 10 + 0.5).toFixed(2)
    const bondValue = (parseFloat(milestoneValue) * 0.3).toFixed(3)
    const protocolFee = (parseFloat(milestoneValue) * 0.025).toFixed(4)

    const resolvedAt = new Date(now - (addressNum % 24) * 60 * 60 * 1000)
    const fundedAt = new Date(resolvedAt.getTime() - 7 * 24 * 60 * 60 * 1000)
    const submittedAt = new Date(fundedAt.getTime() + 3 * 24 * 60 * 60 * 1000)
    const disputedAt = new Date(submittedAt.getTime() + 12 * 60 * 60 * 1000)
    const marketClosedAt = new Date(disputedAt.getTime() + 48 * 60 * 60 * 1000)

    // Transaction history
    const transactions: TransactionRecord[] = [
        {
            id: "tx1",
            type: "FUNDED",
            txHash: "0x" + "a".repeat(60).slice(0, 62) + addressNum.toString(16).padStart(2, '0'),
            timestamp: fundedAt,
            description: "Escrow funded by client",
            amount: milestoneValue,
            from: "0x" + "c".repeat(40).slice(0, 38) + address.slice(-2),
        },
        {
            id: "tx2",
            type: "SUBMITTED",
            txHash: "0x" + "b".repeat(60).slice(0, 62) + addressNum.toString(16).padStart(2, '0'),
            timestamp: submittedAt,
            description: "Work submitted by freelancer",
            from: "0x" + "f".repeat(40).slice(0, 38) + address.slice(-2),
        },
        {
            id: "tx3",
            type: "DISPUTED",
            txHash: "0x" + "d".repeat(60).slice(0, 62) + addressNum.toString(16).padStart(2, '0'),
            timestamp: disputedAt,
            description: "Dispute opened by client",
            amount: bondValue,
            from: "0x" + "c".repeat(40).slice(0, 38) + address.slice(-2),
        },
        {
            id: "tx4",
            type: "RESOLVED",
            txHash: "0x" + "e".repeat(60).slice(0, 62) + addressNum.toString(16).padStart(2, '0'),
            timestamp: marketClosedAt,
            description: `Market resolved: ${winningOutcome} wins`,
        },
        {
            id: "tx5",
            type: "PAYOUT",
            txHash: "0x" + "f".repeat(60).slice(0, 62) + addressNum.toString(16).padStart(2, '0'),
            timestamp: new Date(marketClosedAt.getTime() + 2 * 60 * 1000),
            description: `Payout to ${winner}`,
            amount: (parseFloat(milestoneValue) + parseFloat(bondValue) * 2 - parseFloat(protocolFee)).toFixed(4),
            to: winner === "freelancer"
                ? "0x" + "f".repeat(40).slice(0, 38) + address.slice(-2)
                : "0x" + "c".repeat(40).slice(0, 38) + address.slice(-2),
        },
    ]

    // Payout breakdown
    const payouts: PayoutRecord[] = winner === "freelancer" ? [
        {
            recipient: "0x" + "f".repeat(40).slice(0, 38) + address.slice(-2),
            recipientLabel: "Freelancer",
            amount: milestoneValue,
            type: "PRINCIPAL",
            txHash: "0x" + "f1".repeat(31) + addressNum.toString(16).padStart(2, '0'),
        },
        {
            recipient: "0x" + "f".repeat(40).slice(0, 38) + address.slice(-2),
            recipientLabel: "Freelancer",
            amount: (parseFloat(bondValue) * 2).toFixed(3),
            type: "BOND",
            txHash: "0x" + "f2".repeat(31) + addressNum.toString(16).padStart(2, '0'),
        },
        {
            recipient: "0x" + "p".repeat(40).slice(0, 38) + "00",
            recipientLabel: "Protocol Treasury",
            amount: protocolFee,
            type: "PROTOCOL_FEE",
            txHash: "0x" + "f3".repeat(31) + addressNum.toString(16).padStart(2, '0'),
        },
    ] : [
        {
            recipient: "0x" + "c".repeat(40).slice(0, 38) + address.slice(-2),
            recipientLabel: "Client",
            amount: milestoneValue,
            type: "PRINCIPAL",
            txHash: "0x" + "c1".repeat(31) + addressNum.toString(16).padStart(2, '0'),
        },
        {
            recipient: "0x" + "c".repeat(40).slice(0, 38) + address.slice(-2),
            recipientLabel: "Client",
            amount: (parseFloat(bondValue) * 2).toFixed(3),
            type: "BOND",
            txHash: "0x" + "c2".repeat(31) + addressNum.toString(16).padStart(2, '0'),
        },
        {
            recipient: "0x" + "p".repeat(40).slice(0, 38) + "00",
            recipientLabel: "Protocol Treasury",
            amount: protocolFee,
            type: "PROTOCOL_FEE",
            txHash: "0x" + "c3".repeat(31) + addressNum.toString(16).padStart(2, '0'),
        },
    ]

    return {
        winningOutcome,
        winner,
        resolvedAt,
        transactions,
        payouts,
        milestoneValue,
        bondValue,
        protocolFee,
        marketId: (addressNum % 100).toString(),
    }
}

export default function EscrowResolved({ address }: EscrowResolvedProps) {
    const router = useRouter()
    const { isConnected } = useWallet()
    const { escrow, isLoading, error, userRole } = useEscrowDetail(address)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    // Generate resolution data
    const resolutionData = generateMockResolutionData(address)

    // Redirect to connect if not connected
    useEffect(() => {
        if (!isConnected) {
            router.push("/connect")
        }
    }, [isConnected, router])

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getTransactionIcon = (type: TransactionRecord["type"]) => {
        switch (type) {
            case "FUNDED": return <ArrowDownLeft className="h-4 w-4 text-green-400" />
            case "SUBMITTED": return <FileText className="h-4 w-4 text-blue-400" />
            case "DISPUTED": return <Scale className="h-4 w-4 text-red-400" />
            case "RESOLVED": return <CheckCircle2 className="h-4 w-4 text-purple-400" />
            case "PAYOUT": return <ArrowUpRight className="h-4 w-4 text-green-400" />
        }
    }

    if (!isConnected) {
        return null
    }

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden">
            <WebGLShader />

            <div className="relative z-10 min-h-screen px-4 py-8">
                <div className="mx-auto max-w-4xl">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="mb-6 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-white/60" />
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-400" />
                            <h2 className="mb-2 text-xl font-bold text-white">Error Loading Escrow</h2>
                            <p className="text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Resolved Escrow Content - Read Only */}
                    {!isLoading && !error && escrow && (
                        <>
                            {/* Resolved Banner */}
                            <div className="mb-6 flex items-center justify-center gap-3 rounded-xl border border-gray-500/30 bg-gray-500/10 py-3">
                                <Lock className="h-5 w-5 text-gray-400" />
                                <span className="font-medium text-gray-300">
                                    This escrow is resolved and read-only
                                </span>
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>

                            {/* Header */}
                            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-3">
                                        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                                            Escrow — Resolved
                                        </h1>
                                        <span className="rounded-full border border-gray-500/30 bg-gray-500/20 px-3 py-1 text-sm font-medium text-gray-300">
                                            {getStateLabel("RESOLVED")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/50">
                                        <span className="font-mono text-sm">{truncateAddress(address)}</span>
                                        <button
                                            onClick={() => copyToClipboard(address, "address")}
                                            className="text-white/40 hover:text-white"
                                        >
                                            {copiedField === "address" ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* User Role Badge */}
                                {userRole && userRole !== "observer" && (
                                    <span
                                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${userRole === "client"
                                            ? "border-cyan-500/30 bg-cyan-500/20 text-cyan-300"
                                            : "border-orange-500/30 bg-orange-500/20 text-orange-300"
                                            }`}
                                    >
                                        {userRole === "client" ? (
                                            <Users className="h-4 w-4" />
                                        ) : (
                                            <Briefcase className="h-4 w-4" />
                                        )}
                                        You were the {userRole === "client" ? "Client" : "Freelancer"}
                                    </span>
                                )}
                            </div>

                            {/* A. Final Outcome */}
                            <section className="mb-8">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                                    <Trophy className="h-5 w-5 text-yellow-400" />
                                    Final Outcome
                                </h2>

                                <div className={`rounded-2xl border-2 p-6 ${resolutionData.winningOutcome === "YES"
                                        ? "border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/5"
                                        : "border-red-500/50 bg-gradient-to-br from-red-500/10 to-orange-500/5"
                                    }`}>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${resolutionData.winningOutcome === "YES" ? "bg-green-500" : "bg-red-500"
                                                }`}>
                                                {resolutionData.winningOutcome === "YES" ? (
                                                    <ThumbsUp className="h-7 w-7 text-white" />
                                                ) : (
                                                    <ThumbsDown className="h-7 w-7 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-2xl font-extrabold ${resolutionData.winningOutcome === "YES" ? "text-green-400" : "text-red-400"
                                                    }`}>
                                                    {resolutionData.winningOutcome}
                                                </p>
                                                <p className="text-white/70">
                                                    {resolutionData.winningOutcome === "YES"
                                                        ? "Freelancer work was completed"
                                                        : "Milestone was not completed"
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm text-white/50">Winner</p>
                                            <p className={`text-lg font-bold capitalize ${resolutionData.winner === "freelancer" ? "text-orange-400" : "text-cyan-400"
                                                }`}>
                                                {resolutionData.winner}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-sm text-white/60">
                                        <Clock className="h-4 w-4" />
                                        Resolved on {formatDate(resolutionData.resolvedAt)}
                                    </div>
                                </div>
                            </section>

                            {/* B. Escrow Summary */}
                            <section className="mb-8 rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                                        <Shield className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">Escrow Summary</h2>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Client */}
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Users className="h-4 w-4 text-cyan-400" />
                                            <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                                                Client
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-sm text-white">
                                                {truncateAddress(escrow.client)}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(escrow.client, "client")}
                                                className="text-white/40 hover:text-white"
                                            >
                                                {copiedField === "client" ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Freelancer */}
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-orange-400" />
                                            <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                                                Freelancer
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-sm text-white">
                                                {truncateAddress(escrow.freelancer)}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(escrow.freelancer, "freelancer")}
                                                className="text-white/40 hover:text-white"
                                            >
                                                {copiedField === "freelancer" ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Milestone Value */}
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Wallet className="h-4 w-4 text-green-400" />
                                            <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                                                Milestone Value
                                            </span>
                                        </div>
                                        <span className="text-xl font-bold text-white">
                                            {resolutionData.milestoneValue}{" "}
                                            <span className="text-sm font-normal text-white/60">ETH</span>
                                        </span>
                                    </div>

                                    {/* Bond Value */}
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-purple-400" />
                                            <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                                                Total Bonds Staked
                                            </span>
                                        </div>
                                        <span className="text-xl font-bold text-white">
                                            {(parseFloat(resolutionData.bondValue) * 2).toFixed(3)}{" "}
                                            <span className="text-sm font-normal text-white/60">ETH</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Link to Resolution Market */}
                                <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                                    <Scale className="h-4 w-4 text-purple-400" />
                                    <span className="text-sm text-white/60">Resolution Market ID:</span>
                                    <a
                                        href={`/resolution/${resolutionData.marketId}`}
                                        className="flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-300"
                                    >
                                        #{resolutionData.marketId}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </section>

                            {/* C. Payout Breakdown */}
                            <section className="mb-8">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                                    <Receipt className="h-5 w-5 text-green-400" />
                                    Payout Breakdown
                                </h2>

                                <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
                                    <div className="space-y-3">
                                        {resolutionData.payouts.map((payout, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-center justify-between rounded-xl border p-4 ${payout.type === "PROTOCOL_FEE"
                                                        ? "border-white/10 bg-white/5"
                                                        : "border-green-500/20 bg-green-500/5"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {payout.type === "PROTOCOL_FEE" ? (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                                            <Receipt className="h-5 w-5 text-white/60" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
                                                            <ArrowUpRight className="h-5 w-5 text-green-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-white">
                                                            {payout.type === "PRINCIPAL" && "Milestone Principal"}
                                                            {payout.type === "BOND" && "Dispute Bonds (2x)"}
                                                            {payout.type === "PROTOCOL_FEE" && "Protocol Fee (2.5%)"}
                                                        </p>
                                                        <div className="flex items-center gap-1 text-sm text-white/50">
                                                            <span>→ {payout.recipientLabel}</span>
                                                            <span className="font-mono">({truncateAddress(payout.recipient)})</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-bold ${payout.type === "PROTOCOL_FEE" ? "text-white/60" : "text-green-400"
                                                        }`}>
                                                        {payout.type === "PROTOCOL_FEE" ? "-" : "+"}{payout.amount} ETH
                                                    </p>
                                                    <a
                                                        href={`https://sepolia.etherscan.io/tx/${payout.txHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-end gap-1 text-xs text-blue-400 hover:text-blue-300"
                                                    >
                                                        <Hash className="h-3 w-3" />
                                                        {truncateAddress(payout.txHash)}
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* D. Transaction History */}
                            <section className="mb-8">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                                    <History className="h-5 w-5 text-blue-400" />
                                    Transaction History
                                </h2>

                                <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl">
                                    <div className="divide-y divide-white/10">
                                        {resolutionData.transactions.map((tx, index) => (
                                            <div key={tx.id} className="flex items-start gap-4 p-4">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/5">
                                                    {getTransactionIcon(tx.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="font-medium text-white">{tx.description}</p>
                                                            <p className="mt-1 text-sm text-white/50">
                                                                {formatDate(tx.timestamp)}
                                                            </p>
                                                        </div>
                                                        {tx.amount && (
                                                            <span className={`text-sm font-medium ${tx.type === "PAYOUT" ? "text-green-400" : "text-white"
                                                                }`}>
                                                                {tx.type === "PAYOUT" ? "+" : ""}{tx.amount} ETH
                                                            </span>
                                                        )}
                                                    </div>
                                                    <a
                                                        href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-2 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                                    >
                                                        <LinkIcon className="h-3 w-3" />
                                                        {truncateAddress(tx.txHash)}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* E. Immutable Record Notice */}
                            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                                <Lock className="mx-auto mb-3 h-8 w-8 text-white/40" />
                                <h3 className="text-lg font-semibold text-white">Immutable Record</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
                                    This escrow and its resolution are permanently recorded on the Ethereum blockchain.
                                    All transactions are final and cannot be modified or reversed.
                                </p>
                                <a
                                    href={`https://sepolia.etherscan.io/address/${address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/70 transition-all hover:bg-white/10 hover:text-white"
                                >
                                    View on Etherscan
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
