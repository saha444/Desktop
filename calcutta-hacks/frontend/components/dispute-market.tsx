"use client"

import { useRouter } from "next/navigation"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { useDisputeMarket, formatCountdown } from "@/hooks/useDisputeMarket"
import {
    ArrowLeft,
    Loader2,
    AlertTriangle,
    Clock,
    Wallet,
    Scale,
    ThumbsUp,
    ThumbsDown,
    ChevronDown,
    ChevronUp,
    Info,
    Zap,
    TrendingUp,
    Shield,
    ExternalLink,
} from "lucide-react"
import { useState, useEffect } from "react"

interface DisputeMarketProps {
    id: string
}

export default function DisputeMarket({ id }: DisputeMarketProps) {
    const router = useRouter()
    const {
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
    } = useDisputeMarket(id)

    const [showRules, setShowRules] = useState(false)
    const [countdown, setCountdown] = useState("")

    // Live countdown timer
    useEffect(() => {
        if (!market) return

        const updateCountdown = () => {
            setCountdown(formatCountdown(market.deadline))
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)
        return () => clearInterval(interval)
    }, [market])

    const { multiplier, effectiveEth } = getTimeWeightedImpact()
    const potentialPayout = getPotentialPayout()

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
                            <h2 className="mb-2 text-xl font-bold text-white">Error Loading Market</h2>
                            <p className="text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Market Content */}
                    {!isLoading && !error && market && (
                        <>
                            {/* A. Market Header */}
                            <section className="mb-8 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 p-6 backdrop-blur-xl">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                                        <Scale className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                                            Resolution Market
                                        </h1>
                                        <p className="text-sm text-white/50">Market #{id}</p>
                                    </div>
                                </div>

                                <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                                        The Question
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-white">{market.question}</p>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <a
                                        href={`/escrow/${market.escrowAddress}`}
                                        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                                    >
                                        View Original Escrow
                                        <ExternalLink className="h-3 w-3" />
                                    </a>

                                    {/* Countdown */}
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-yellow-400" />
                                        <div>
                                            <p className="text-xs text-white/50">Time Remaining</p>
                                            <p className={`text-xl font-bold ${market.deadline.getTime() - Date.now() < 3600000
                                                    ? "text-red-400"
                                                    : "text-green-400"
                                                }`}>
                                                {countdown}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* B. Outcome Panels */}
                            <section className="mb-8 grid gap-4 md:grid-cols-2">
                                {/* YES Outcome */}
                                <button
                                    onClick={() => setSelectedOutcome("YES")}
                                    className={`rounded-2xl border p-6 text-left transition-all ${selectedOutcome === "YES"
                                            ? "border-green-500 bg-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                                            : "border-white/20 bg-white/5 hover:border-green-500/50 hover:bg-green-500/10"
                                        }`}
                                >
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedOutcome === "YES" ? "bg-green-500" : "bg-green-500/20"
                                            }`}>
                                            <ThumbsUp className={`h-5 w-5 ${selectedOutcome === "YES" ? "text-white" : "text-green-400"
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-green-400">YES</p>
                                            <p className="text-sm text-white/60">{market.yesOutcome.description}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/50">Total ETH</span>
                                            <span className="font-medium text-white">{market.yesOutcome.totalEth} ETH</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/50">Weighted ETH</span>
                                            <span className="font-medium text-green-400">{market.yesOutcome.weightedEth} ETH</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-white/10">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                                                style={{ width: `${market.yesOutcome.percentageShare}%` }}
                                            />
                                        </div>
                                        <p className="text-center text-sm font-medium text-green-400">
                                            {market.yesOutcome.percentageShare}% share
                                        </p>
                                    </div>
                                </button>

                                {/* NO Outcome */}
                                <button
                                    onClick={() => setSelectedOutcome("NO")}
                                    className={`rounded-2xl border p-6 text-left transition-all ${selectedOutcome === "NO"
                                            ? "border-red-500 bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                                            : "border-white/20 bg-white/5 hover:border-red-500/50 hover:bg-red-500/10"
                                        }`}
                                >
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedOutcome === "NO" ? "bg-red-500" : "bg-red-500/20"
                                            }`}>
                                            <ThumbsDown className={`h-5 w-5 ${selectedOutcome === "NO" ? "text-white" : "text-red-400"
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-red-400">NO</p>
                                            <p className="text-sm text-white/60">{market.noOutcome.description}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/50">Total ETH</span>
                                            <span className="font-medium text-white">{market.noOutcome.totalEth} ETH</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/50">Weighted ETH</span>
                                            <span className="font-medium text-red-400">{market.noOutcome.weightedEth} ETH</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-white/10">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                                                style={{ width: `${market.noOutcome.percentageShare}%` }}
                                            />
                                        </div>
                                        <p className="text-center text-sm font-medium text-red-400">
                                            {market.noOutcome.percentageShare}% share
                                        </p>
                                    </div>
                                </button>
                            </section>

                            {/* C. Deposit Flow */}
                            <section className="mb-8 rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                                        <Wallet className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">Make a Deposit</h2>
                                </div>

                                {/* Selected Outcome */}
                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium text-white/80">
                                        Your Prediction
                                    </label>
                                    <div className={`rounded-xl border p-3 ${selectedOutcome === "YES"
                                            ? "border-green-500/50 bg-green-500/10"
                                            : selectedOutcome === "NO"
                                                ? "border-red-500/50 bg-red-500/10"
                                                : "border-white/20 bg-white/5"
                                        }`}>
                                        {selectedOutcome ? (
                                            <span className={`font-semibold ${selectedOutcome === "YES" ? "text-green-400" : "text-red-400"
                                                }`}>
                                                {selectedOutcome} — {selectedOutcome === "YES" ? market.yesOutcome.description : market.noOutcome.description}
                                            </span>
                                        ) : (
                                            <span className="text-white/40">Select an outcome above</span>
                                        )}
                                    </div>
                                </div>

                                {/* Amount Input */}
                                <div className="mb-6">
                                    <label className="mb-2 block text-sm font-medium text-white/80">
                                        ETH Amount
                                    </label>
                                    <div className="relative">
                                        <Wallet className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.001"
                                            placeholder="0.1"
                                            value={depositAmount}
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                            className="w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-12 pr-16 text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">ETH</span>
                                    </div>
                                </div>

                                {/* Preview */}
                                {depositAmount && parseFloat(depositAmount) > 0 && (
                                    <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                                        <p className="mb-3 text-sm font-medium text-white">Deposit Preview</p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-white/60">
                                                    <Zap className="h-4 w-4 text-yellow-400" />
                                                    Time Multiplier
                                                </span>
                                                <span className="font-medium text-yellow-400">{multiplier}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2 text-white/60">
                                                    <TrendingUp className="h-4 w-4 text-blue-400" />
                                                    Effective Weight
                                                </span>
                                                <span className="font-medium text-blue-400">{effectiveEth} ETH</span>
                                            </div>
                                            {selectedOutcome && (
                                                <div className="flex items-center justify-between border-t border-white/10 pt-2">
                                                    <span className="flex items-center gap-2 text-white/60">
                                                        <Shield className="h-4 w-4 text-green-400" />
                                                        Potential Payout (if win)
                                                    </span>
                                                    <span className="font-bold text-green-400">{potentialPayout} ETH</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-3 text-xs text-white/40">
                                            <Info className="mr-1 inline h-3 w-3" />
                                            Payout not guaranteed. Depends on final outcome & total deposits.
                                        </p>
                                    </div>
                                )}

                                {/* CTA */}
                                <button
                                    onClick={deposit}
                                    disabled={!selectedOutcome || !depositAmount || parseFloat(depositAmount) <= 0 || isDepositing}
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-50"
                                >
                                    {isDepositing ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Depositing...
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="h-5 w-5" />
                                            Deposit ETH
                                        </>
                                    )}
                                </button>
                            </section>

                            {/* D. Market Rules (Collapsible) */}
                            <section className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl">
                                <button
                                    onClick={() => setShowRules(!showRules)}
                                    className="flex w-full items-center justify-between p-6"
                                >
                                    <div className="flex items-center gap-3">
                                        <Info className="h-5 w-5 text-white/60" />
                                        <span className="font-semibold text-white">Market Rules</span>
                                    </div>
                                    {showRules ? (
                                        <ChevronUp className="h-5 w-5 text-white/60" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-white/60" />
                                    )}
                                </button>

                                {showRules && (
                                    <div className="border-t border-white/10 p-6 pt-0">
                                        <div className="mt-6 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">1</div>
                                                <div>
                                                    <p className="font-medium text-white">Winner-Takes-All</p>
                                                    <p className="text-sm text-white/60">
                                                        The outcome with the most time-weighted ETH wins the entire pool.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">2</div>
                                                <div>
                                                    <p className="font-medium text-white">No Appeal</p>
                                                    <p className="text-sm text-white/60">
                                                        Market resolution is final. No reversals or disputes after settlement.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">3</div>
                                                <div>
                                                    <p className="font-medium text-white">No Admin</p>
                                                    <p className="text-sm text-white/60">
                                                        Resolution is fully decentralized. No team can override the outcome.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">4</div>
                                                <div>
                                                    <p className="font-medium text-white">Time-Weighted Capital</p>
                                                    <p className="text-sm text-white/60">
                                                        Earlier deposits receive higher weighting (up to 2x), rewarding early conviction.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
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
