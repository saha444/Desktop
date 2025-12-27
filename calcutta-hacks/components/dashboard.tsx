"use client"

import { useRouter } from "next/navigation"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { useWallet } from "@/hooks/useWallet"
import {
    useDashboard,
    EscrowItem,
    DisputeMarket,
    getStatusLabel,
    getStatusColor,
    getRoleColor,
    formatTimeLeft,
    truncateAddress,
} from "@/hooks/useDashboard"
import {
    Wallet,
    Clock,
    ArrowRight,
    RefreshCw,
    Loader2,
    AlertTriangle,
    Briefcase,
    Users,
    Scale,
    Plus,
    TrendingUp,
    CheckCircle2,
} from "lucide-react"
import { useEffect } from "react"

// Escrow Card Component
function EscrowCard({ escrow }: { escrow: EscrowItem }) {
    const router = useRouter()

    return (
        <div className="group rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/10">
            {/* Header: Role + Status */}
            <div className="mb-4 flex items-center justify-between">
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getRoleColor(
                        escrow.role
                    )}`}
                >
                    {escrow.role === "client" ? (
                        <Users className="h-3 w-3" />
                    ) : (
                        <Briefcase className="h-3 w-3" />
                    )}
                    {escrow.role === "client" ? "Client" : "Freelancer"}
                </span>
                <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                        escrow.status
                    )}`}
                >
                    {getStatusLabel(escrow.status)}
                </span>
            </div>

            {/* Counterparty */}
            <div className="mb-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/50">
                    {escrow.role === "client" ? "Freelancer" : "Client"}
                </p>
                <p className="font-mono text-sm text-white">
                    {truncateAddress(escrow.counterparty)}
                </p>
            </div>

            {/* Milestone Value */}
            <div className="mb-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/50">
                    Milestone Value
                </p>
                <p className="text-2xl font-bold text-white">
                    {escrow.milestoneValue}{" "}
                    <span className="text-base font-normal text-white/60">ETH</span>
                </p>
            </div>

            {/* Time Left */}
            <div className="mb-6 flex items-center gap-2 text-white/60">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formatTimeLeft(escrow.deadline)}</span>
            </div>

            {/* CTA Button */}
            <button
                onClick={() => router.push(`/escrow/${escrow.address}`)}
                className="group/btn flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-medium text-white transition-all hover:border-white/40 hover:bg-white/10"
            >
                View Escrow
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </button>
        </div>
    )
}

// Dispute Market Card Component
function DisputeMarketCard({ market }: { market: DisputeMarket }) {
    const router = useRouter()
    const totalStaked = parseFloat(market.totalForFreelancer) + parseFloat(market.totalForClient)
    const freelancerPercent = (parseFloat(market.totalForFreelancer) / totalStaked) * 100
    const clientPercent = (parseFloat(market.totalForClient) / totalStaked) * 100

    return (
        <div className="group rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/10">
            {/* Header: Escrow ID + Status */}
            <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                    <Scale className="h-3 w-3" />
                    Escrow #{market.escrowId}
                </span>
                {market.isResolved ? (
                    <span className="rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1 text-xs font-medium text-green-300">
                        Resolved
                    </span>
                ) : (
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
                        Active
                    </span>
                )}
            </div>

            {/* Your Vote */}
            <div className="mb-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/50">
                    Your Vote
                </p>
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${market.yourVote === "FREELANCER"
                            ? "border-orange-500/30 bg-orange-500/20 text-orange-300"
                            : "border-cyan-500/30 bg-cyan-500/20 text-cyan-300"
                        }`}
                >
                    {market.yourVote === "FREELANCER" ? (
                        <Briefcase className="h-3.5 w-3.5" />
                    ) : (
                        <Users className="h-3.5 w-3.5" />
                    )}
                    {market.yourVote === "FREELANCER" ? "Freelancer" : "Client"}
                </span>
            </div>

            {/* Your Stake */}
            <div className="mb-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/50">
                    Your Stake
                </p>
                <p className="text-2xl font-bold text-white">
                    {market.yourStake}{" "}
                    <span className="text-base font-normal text-white/60">ETH</span>
                </p>
            </div>

            {/* Weighted Totals Bar */}
            <div className="mb-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
                    Current Totals
                </p>
                <div className="mb-2 flex h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                        className="bg-gradient-to-r from-orange-500 to-orange-400 transition-all"
                        style={{ width: `${freelancerPercent}%` }}
                    />
                    <div
                        className="bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all"
                        style={{ width: `${clientPercent}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-white/60">
                    <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        Freelancer: {market.totalForFreelancer} ETH
                    </span>
                    <span className="flex items-center gap-1">
                        Client: {market.totalForClient} ETH
                        <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    </span>
                </div>
            </div>

            {/* Time Remaining */}
            <div className="mb-6 flex items-center gap-2 text-white/60">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                    {market.isResolved ? "Voting ended" : formatTimeLeft(market.votingEndsAt)}
                </span>
            </div>

            {/* CTA Button */}
            <button
                onClick={() => router.push(`/dispute/${market.id}`)}
                className="group/btn flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-medium text-white transition-all hover:border-white/40 hover:bg-white/10"
            >
                View Market
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </button>
        </div>
    )
}

export default function Dashboard() {
    const router = useRouter()
    const { isConnected, address } = useWallet()
    const { escrows, disputeMarkets, isLoading, error, refresh } = useDashboard()

    // Redirect to connect page if not connected
    useEffect(() => {
        if (!isConnected) {
            router.push("/connect")
        }
    }, [isConnected, router])

    if (!isConnected) {
        return null
    }

    const activeDisputeMarkets = disputeMarkets.filter((m) => !m.isResolved)

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden">
            <WebGLShader />

            <div className="relative z-10 min-h-screen px-4 py-8">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                                Dashboard
                            </h1>
                            <div className="mt-2 flex items-center gap-2 text-white/60">
                                <Wallet className="h-4 w-4" />
                                <span className="font-mono text-sm">
                                    {address && truncateAddress(address)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {/* Refresh Button */}
                            <button
                                onClick={refresh}
                                disabled={isLoading}
                                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/10 disabled:opacity-50"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                                />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Create New Escrow CTA */}
                    <section className="mb-10">
                        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 p-6 backdrop-blur-xl">
                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="mb-1 text-xl font-bold text-white">
                                        Create New Escrow
                                    </h2>
                                    <p className="text-sm text-white/60">
                                        Start a new secure payment with milestone-based releases
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push("/create")}
                                    className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                                >
                                    <Plus className="h-5 w-5" />
                                    Create Escrow
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Error State */}
                    {error && (
                        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-white/60" />
                        </div>
                    )}

                    {!isLoading && !error && (
                        <>
                            {/* Active Escrows Section */}
                            <section className="mb-10">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                                        <Briefcase className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">
                                        Your Active Escrows
                                    </h2>
                                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-sm text-white/60">
                                        {escrows.length}
                                    </span>
                                </div>

                                {escrows.length === 0 ? (
                                    <div className="rounded-2xl border border-white/20 bg-white/5 p-8 text-center backdrop-blur-xl">
                                        <p className="text-white/60">
                                            No active escrows. Create one to get started!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {escrows.map((escrow) => (
                                            <EscrowCard key={escrow.id} escrow={escrow} />
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Dispute Markets Section */}
                            <section>
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                                        <Scale className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">
                                        Dispute Markets You're In
                                    </h2>
                                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-sm text-white/60">
                                        {disputeMarkets.length}
                                    </span>
                                </div>

                                {disputeMarkets.length === 0 ? (
                                    <div className="rounded-2xl border border-white/20 bg-white/5 p-8 text-center backdrop-blur-xl">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                                            <TrendingUp className="h-8 w-8 text-white/60" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-white">
                                            No Active Markets
                                        </h3>
                                        <p className="text-white/60">
                                            Participate in dispute resolution to earn rewards
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {disputeMarkets.map((market) => (
                                            <DisputeMarketCard key={market.id} market={market} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

