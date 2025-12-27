"use client"

import { useRouter } from "next/navigation"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { useMarketResolution, formatTimeSince } from "@/hooks/useMarketResolution"
import {
    ArrowLeft,
    Loader2,
    AlertTriangle,
    Trophy,
    ThumbsUp,
    ThumbsDown,
    Wallet,
    Gift,
    CheckCircle,
    ExternalLink,
    Sparkles,
    Users,
    Coins,
    ArrowRight,
    Shield,
    Percent,
} from "lucide-react"

interface MarketResolutionProps {
    id: string
}

export default function MarketResolution({ id }: MarketResolutionProps) {
    const router = useRouter()
    const {
        resolution,
        isLoading,
        error,
        isClaiming,
        claimFunds,
    } = useMarketResolution(id)

    const isWinner = resolution?.userDeposit?.outcome === resolution?.winningOutcome
    const didParticipate = resolution?.userDeposit !== null

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
                            <h2 className="mb-2 text-xl font-bold text-white">Error Loading Resolution</h2>
                            <p className="text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Resolution Content */}
                    {!isLoading && !error && resolution && (
                        <>
                            {/* A. Resolution Header with Winner Announcement */}
                            <section className="mb-8 overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-xl">
                                {/* Celebration Banner */}
                                <div className={`flex items-center justify-center gap-3 py-4 ${resolution.winningOutcome === "YES"
                                        ? "bg-gradient-to-r from-green-500/20 via-emerald-500/30 to-green-500/20"
                                        : "bg-gradient-to-r from-red-500/20 via-orange-500/30 to-red-500/20"
                                    }`}>
                                    <Trophy className={`h-6 w-6 ${resolution.winningOutcome === "YES" ? "text-green-400" : "text-red-400"
                                        }`} />
                                    <span className="text-lg font-bold text-white">
                                        Market Resolved — {resolution.winningOutcome} Wins!
                                    </span>
                                    <Trophy className={`h-6 w-6 ${resolution.winningOutcome === "YES" ? "text-green-400" : "text-red-400"
                                        }`} />
                                </div>

                                <div className="p-6">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                                            <Sparkles className="h-6 w-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                                                Resolution Summary
                                            </h1>
                                            <p className="text-sm text-white/50">Market #{id}</p>
                                        </div>
                                    </div>

                                    <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                                            The Question
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-white">{resolution.question}</p>
                                    </div>

                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <a
                                            href={`/escrow/${resolution.escrowAddress}`}
                                            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                                        >
                                            View Original Escrow
                                            <ExternalLink className="h-3 w-3" />
                                        </a>

                                        <div className="flex items-center gap-2 text-sm text-white/60">
                                            <CheckCircle className="h-4 w-4 text-green-400" />
                                            Resolved {formatTimeSince(resolution.resolvedAt)}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* B. Winning Outcome Display */}
                            <section className="mb-8">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                                    <Trophy className="h-5 w-5 text-yellow-400" />
                                    Winning Outcome
                                </h2>

                                <div className={`rounded-2xl border-2 p-6 ${resolution.winningOutcome === "YES"
                                        ? "border-green-500 bg-gradient-to-br from-green-500/20 to-emerald-500/10 shadow-[0_0_40px_rgba(34,197,94,0.2)]"
                                        : "border-red-500 bg-gradient-to-br from-red-500/20 to-orange-500/10 shadow-[0_0_40px_rgba(239,68,68,0.2)]"
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${resolution.winningOutcome === "YES" ? "bg-green-500" : "bg-red-500"
                                            }`}>
                                            {resolution.winningOutcome === "YES" ? (
                                                <ThumbsUp className="h-8 w-8 text-white" />
                                            ) : (
                                                <ThumbsDown className="h-8 w-8 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-3xl font-extrabold ${resolution.winningOutcome === "YES" ? "text-green-400" : "text-red-400"
                                                }`}>
                                                {resolution.winningOutcome}
                                            </p>
                                            <p className="text-white/70">
                                                {resolution.winningOutcome === "YES"
                                                    ? "Freelancer work was completed as specified"
                                                    : "Milestone was not completed as specified"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* C. Final Capital Distribution */}
                            <section className="mb-8">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                                    <Coins className="h-5 w-5 text-blue-400" />
                                    Final Capital Distribution
                                </h2>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* YES Pool */}
                                    <div className={`rounded-2xl border p-5 ${resolution.winningOutcome === "YES"
                                            ? "border-green-500/50 bg-green-500/10"
                                            : "border-white/20 bg-white/5"
                                        }`}>
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <ThumbsUp className={`h-5 w-5 ${resolution.winningOutcome === "YES" ? "text-green-400" : "text-white/40"
                                                    }`} />
                                                <span className={`font-bold ${resolution.winningOutcome === "YES" ? "text-green-400" : "text-white/60"
                                                    }`}>YES Pool</span>
                                            </div>
                                            {resolution.winningOutcome === "YES" && (
                                                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                                                    WINNER
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-white/50">Total ETH</span>
                                                <span className="font-medium text-white">{resolution.yesPool.totalEth} ETH</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/50">Weighted ETH</span>
                                                <span className="font-medium text-green-400">{resolution.yesPool.weightedEth} ETH</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="flex items-center gap-1 text-white/50">
                                                    <Users className="h-3 w-3" /> Participants
                                                </span>
                                                <span className="font-medium text-white">{resolution.yesPool.participants}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* NO Pool */}
                                    <div className={`rounded-2xl border p-5 ${resolution.winningOutcome === "NO"
                                            ? "border-red-500/50 bg-red-500/10"
                                            : "border-white/20 bg-white/5"
                                        }`}>
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <ThumbsDown className={`h-5 w-5 ${resolution.winningOutcome === "NO" ? "text-red-400" : "text-white/40"
                                                    }`} />
                                                <span className={`font-bold ${resolution.winningOutcome === "NO" ? "text-red-400" : "text-white/60"
                                                    }`}>NO Pool</span>
                                            </div>
                                            {resolution.winningOutcome === "NO" && (
                                                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                                                    WINNER
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-white/50">Total ETH</span>
                                                <span className="font-medium text-white">{resolution.noPool.totalEth} ETH</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/50">Weighted ETH</span>
                                                <span className="font-medium text-red-400">{resolution.noPool.weightedEth} ETH</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="flex items-center gap-1 text-white/50">
                                                    <Users className="h-3 w-3" /> Participants
                                                </span>
                                                <span className="font-medium text-white">{resolution.noPool.participants}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* D. User Participation & Payout Breakdown */}
                            {didParticipate && (
                                <section className="mb-8">
                                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                                        <Wallet className="h-5 w-5 text-purple-400" />
                                        Your Participation
                                    </h2>

                                    <div className={`rounded-2xl border p-6 ${isWinner
                                            ? "border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/5"
                                            : "border-red-500/50 bg-gradient-to-br from-red-500/10 to-orange-500/5"
                                        }`}>
                                        {/* Your Deposit */}
                                        <div className="mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                                            <div>
                                                <p className="text-sm text-white/50">Your Deposit</p>
                                                <p className="text-xl font-bold text-white">{resolution.userDeposit?.amount} ETH</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-white/50">Your Prediction</p>
                                                <p className={`text-xl font-bold ${resolution.userDeposit?.outcome === "YES" ? "text-green-400" : "text-red-400"
                                                    }`}>
                                                    {resolution.userDeposit?.outcome}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Result Banner */}
                                        <div className={`mb-6 flex items-center justify-center gap-3 rounded-xl py-3 ${isWinner ? "bg-green-500/20" : "bg-red-500/20"
                                            }`}>
                                            {isWinner ? (
                                                <>
                                                    <Trophy className="h-5 w-5 text-green-400" />
                                                    <span className="font-bold text-green-400">You Won!</span>
                                                    <Trophy className="h-5 w-5 text-green-400" />
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle className="h-5 w-5 text-red-400" />
                                                    <span className="font-bold text-red-400">You Lost</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Payout Breakdown (only for winners) */}
                                        {isWinner && resolution.payout && (
                                            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                                                <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                                                    <Gift className="h-5 w-5 text-yellow-400" />
                                                    Payout Breakdown
                                                </h3>

                                                <div className="space-y-3">
                                                    {/* Winner Principal */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="flex items-center gap-2 text-white/70">
                                                            <Shield className="h-4 w-4 text-blue-400" />
                                                            Your Principal (Returned)
                                                        </span>
                                                        <span className="font-medium text-white">
                                                            {resolution.payout.winnerPrincipal} ETH
                                                        </span>
                                                    </div>

                                                    {/* Share from Losing Side */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="flex items-center gap-2 text-white/70">
                                                            <ArrowRight className="h-4 w-4 text-green-400" />
                                                            Share from Losing Pool
                                                        </span>
                                                        <span className="font-medium text-green-400">
                                                            +{resolution.payout.shareFromLosingPool} ETH
                                                        </span>
                                                    </div>

                                                    {/* Protocol Fee */}
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="flex items-center gap-2 text-white/50">
                                                            <Percent className="h-3 w-3" />
                                                            Protocol Fee (2.5%)
                                                        </span>
                                                        <span className="text-white/50">
                                                            -{resolution.payout.protocolFee} ETH
                                                        </span>
                                                    </div>

                                                    {/* Divider */}
                                                    <div className="border-t border-white/20"></div>

                                                    {/* Total Payout */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-lg font-bold text-white">Total Payout</span>
                                                        <span className="text-2xl font-extrabold text-green-400">
                                                            {resolution.payout.totalPayout} ETH
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Lost Message */}
                                        {!isWinner && (
                                            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                                                <p className="text-white/60">
                                                    Your deposit of <span className="font-semibold text-white">{resolution.userDeposit?.amount} ETH</span> has been redistributed to the winning pool participants.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* E. Did Not Participate */}
                            {!didParticipate && (
                                <section className="mb-8">
                                    <div className="rounded-2xl border border-white/20 bg-white/5 p-6 text-center">
                                        <Users className="mx-auto mb-3 h-10 w-10 text-white/30" />
                                        <p className="text-lg font-medium text-white/60">You did not participate in this market</p>
                                        <p className="mt-1 text-sm text-white/40">
                                            No funds to claim for this resolution.
                                        </p>
                                    </div>
                                </section>
                            )}

                            {/* F. Claim Funds CTA */}
                            {isWinner && resolution.payout && (
                                <section>
                                    {resolution.hasClaimed ? (
                                        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-center">
                                            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-400" />
                                            <h3 className="text-xl font-bold text-green-400">Funds Claimed!</h3>
                                            <p className="mt-1 text-white/60">
                                                {resolution.payout.totalPayout} ETH has been sent to your wallet.
                                            </p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={claimFunds}
                                            disabled={isClaiming}
                                            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 px-8 py-5 text-xl font-bold text-white shadow-[0_0_40px_rgba(34,197,94,0.3)] transition-all hover:shadow-[0_0_60px_rgba(34,197,94,0.5)] disabled:opacity-50"
                                        >
                                            {isClaiming ? (
                                                <>
                                                    <Loader2 className="h-6 w-6 animate-spin" />
                                                    Claiming...
                                                </>
                                            ) : (
                                                <>
                                                    <Gift className="h-6 w-6" />
                                                    Claim {resolution.payout.totalPayout} ETH
                                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </section>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
