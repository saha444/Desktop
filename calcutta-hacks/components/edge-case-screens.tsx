"use client"

import { useRouter } from "next/navigation"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    AlertTriangle,
    Wallet,
    ArrowRight,
    Timer,
    XCircle,
    Zap,
} from "lucide-react"
import { useState, useEffect } from "react"

interface AutoReleaseScreenProps {
    escrowAddress: string
    milestoneValue: string
    freelancerAddress: string
    releasedAt: Date
}

export function AutoReleaseScreen({
    escrowAddress,
    milestoneValue,
    freelancerAddress,
    releasedAt,
}: AutoReleaseScreenProps) {
    const router = useRouter()

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden">
            <WebGLShader />

            <div className="relative z-10 min-h-screen px-4 py-8">
                <div className="mx-auto max-w-2xl">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="mb-6 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>

                    {/* Auto-Release Banner */}
                    <div className="mb-8 flex items-center justify-center gap-3 rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 py-4">
                        <Zap className="h-6 w-6 text-yellow-400" />
                        <span className="text-lg font-bold text-yellow-300">
                            Funds Auto-Released Due to Inaction
                        </span>
                        <Zap className="h-6 w-6 text-yellow-400" />
                    </div>

                    {/* Main Content */}
                    <div className="rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur-xl">
                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                                <CheckCircle className="h-10 w-10 text-green-400" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-white">
                                Payment Released to Freelancer
                            </h1>
                            <p className="mt-2 text-white/60">
                                The dispute deadline passed without a bond being posted.
                            </p>
                        </div>

                        {/* Details */}
                        <div className="mb-6 space-y-4">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/60">Amount Released</span>
                                    <span className="text-xl font-bold text-green-400">{milestoneValue} ETH</span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/60">Recipient</span>
                                    <span className="font-mono text-sm text-white">
                                        {freelancerAddress.slice(0, 6)}...{freelancerAddress.slice(-4)}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/60">Released At</span>
                                    <span className="text-white">{formatDate(releasedAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Explanation */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-2 font-semibold text-white">What Happened?</h3>
                            <ul className="space-y-2 text-sm text-white/60">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/40" />
                                    The freelancer submitted their work on time
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/40" />
                                    The client did not approve or dispute within the deadline
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/40" />
                                    No dispute bond was posted, so funds were auto-released
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-400" />
                                    This action is final and cannot be reversed
                                </li>
                            </ul>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 font-medium text-white transition-all hover:bg-white/10"
                        >
                            Return to Dashboard
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface InsufficientBondScreenProps {
    escrowAddress: string
    milestoneValue: string
    bondRequired: string
    autoReleaseDeadline: Date
    freelancerAddress: string
    onPostBond: () => void
    isLoading: boolean
}

export function InsufficientBondScreen({
    escrowAddress,
    milestoneValue,
    bondRequired,
    autoReleaseDeadline,
    freelancerAddress,
    onPostBond,
    isLoading,
}: InsufficientBondScreenProps) {
    const router = useRouter()
    const [countdown, setCountdown] = useState("")

    useEffect(() => {
        const updateCountdown = () => {
            const now = Date.now()
            const diff = autoReleaseDeadline.getTime() - now

            if (diff <= 0) {
                setCountdown("EXPIRED")
                return
            }

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            if (hours > 0) {
                setCountdown(`${hours}h ${minutes}m ${seconds}s`)
            } else if (minutes > 0) {
                setCountdown(`${minutes}m ${seconds}s`)
            } else {
                setCountdown(`${seconds}s`)
            }
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)
        return () => clearInterval(interval)
    }, [autoReleaseDeadline])

    const isExpired = countdown === "EXPIRED"
    const isUrgent = autoReleaseDeadline.getTime() - Date.now() < 3600000 // Less than 1 hour

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden">
            <WebGLShader />

            <div className="relative z-10 min-h-screen px-4 py-8">
                <div className="mx-auto max-w-2xl">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="mb-6 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>

                    {/* Warning Banner */}
                    <div className={`mb-8 rounded-xl border p-4 ${isUrgent
                            ? "border-red-500/30 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20"
                            : "border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10"
                        }`}>
                        <div className="flex items-center justify-center gap-3">
                            <AlertTriangle className={`h-6 w-6 ${isUrgent ? "text-red-400" : "text-yellow-400"}`} />
                            <span className={`text-lg font-bold ${isUrgent ? "text-red-300" : "text-yellow-300"}`}>
                                {isUrgent ? "URGENT: " : ""}Dispute Bond Not Posted
                            </span>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur-xl">
                        {/* Countdown */}
                        <div className="mb-8 text-center">
                            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-white/50">
                                Auto-Release In
                            </p>
                            <div className={`text-4xl font-extrabold ${isExpired
                                    ? "text-gray-400"
                                    : isUrgent
                                        ? "text-red-400"
                                        : "text-yellow-400"
                                }`}>
                                {countdown}
                            </div>
                            {isExpired ? (
                                <p className="mt-2 text-red-400">
                                    The deadline has passed. Funds have been released.
                                </p>
                            ) : (
                                <p className="mt-2 text-white/60">
                                    Post a bond to dispute, or funds will auto-release to freelancer.
                                </p>
                            )}
                        </div>

                        {/* Risk Warning Box - Following UX Guidelines */}
                        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
                            <h3 className="mb-3 flex items-center gap-2 font-bold text-red-300">
                                <AlertTriangle className="h-5 w-5" />
                                Important: Understand Before You Act
                            </h3>

                            <div className="space-y-4 text-sm">
                                {/* What you're risking */}
                                <div>
                                    <p className="font-medium text-white">⚠️ What You're Risking:</p>
                                    <p className="mt-1 text-white/70">
                                        Your dispute bond of <strong className="text-white">{bondRequired} ETH</strong> (30% of milestone value)
                                    </p>
                                </div>

                                {/* What you can lose */}
                                <div>
                                    <p className="font-medium text-red-300">❌ What You Can Lose:</p>
                                    <ul className="mt-1 space-y-1 text-white/70">
                                        <li>• Your entire bond ({bondRequired} ETH) if you lose the dispute</li>
                                        <li>• The milestone payment still goes to the freelancer if you lose</li>
                                    </ul>
                                </div>

                                {/* What you can gain */}
                                <div>
                                    <p className="font-medium text-green-300">✅ What You Can Gain:</p>
                                    <ul className="mt-1 space-y-1 text-white/70">
                                        <li>• Your milestone payment back ({milestoneValue} ETH)</li>
                                        <li>• Both bonds if freelancer doesn't challenge or you win</li>
                                    </ul>
                                </div>

                                {/* AI disclosure */}
                                <div className="border-t border-white/10 pt-3">
                                    <p className="font-medium text-blue-300">🤖 AI Does NOT Decide:</p>
                                    <p className="mt-1 text-white/70">
                                        The resolution is determined by the community prediction market.
                                        AI may analyze evidence but has <strong className="text-white">no voting power</strong> and
                                        <strong className="text-white"> cannot override the market outcome</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bond Details */}
                        <div className="mb-6 space-y-3">
                            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                                <span className="text-white/60">Milestone Value</span>
                                <span className="font-bold text-white">{milestoneValue} ETH</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                                <span className="text-yellow-300">Bond Required (30%)</span>
                                <span className="font-bold text-yellow-400">{bondRequired} ETH</span>
                            </div>
                        </div>

                        {/* What happens next */}
                        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                            <p className="mb-2 text-sm font-medium text-white">If no bond is posted:</p>
                            <div className="flex items-center gap-2 text-white/70">
                                <Timer className="h-4 w-4 text-yellow-400" />
                                <span>
                                    <strong className="text-white">{milestoneValue} ETH</strong> will be auto-released to the freelancer at{" "}
                                    {autoReleaseDeadline.toLocaleTimeString()} on {autoReleaseDeadline.toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        {!isExpired && (
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
                                >
                                    <XCircle className="h-5 w-5" />
                                    Let It Release
                                </button>
                                <button
                                    onClick={onPostBond}
                                    disabled={isLoading}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all hover:shadow-[0_0_40px_rgba(234,179,8,0.5)]"
                                >
                                    <Wallet className="h-5 w-5" />
                                    Post Bond ({bondRequired} ETH)
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
