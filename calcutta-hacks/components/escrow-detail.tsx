"use client"

import { useRouter } from "next/navigation"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { useWallet } from "@/hooks/useWallet"
import {
    useEscrowDetail,
    getStateLabel,
    getStateColor,
    formatTimeRemaining,
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
    RefreshCw,
    Upload,
    Ban,
    ArrowRight,
    FileText,
    Scale,
    Timer,
} from "lucide-react"
import { useState, useEffect } from "react"

interface EscrowDetailProps {
    address: string
}

export default function EscrowDetail({ address }: EscrowDetailProps) {
    const router = useRouter()
    const { isConnected } = useWallet()
    const { escrow, isLoading, error, userRole, refresh } = useEscrowDetail(address)
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [evidenceFile, setEvidenceFile] = useState<string>("")
    const [showDisputeWarning, setShowDisputeWarning] = useState(false)

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

    // Mock action handlers
    const handleFundEscrow = async () => {
        setIsActionLoading(true)
        await new Promise((r) => setTimeout(r, 2000))
        setIsActionLoading(false)
        refresh()
    }

    const handleSubmitWork = async () => {
        if (!evidenceFile) return
        setIsActionLoading(true)
        await new Promise((r) => setTimeout(r, 2000))
        setIsActionLoading(false)
        refresh()
    }

    const handleApprove = async () => {
        setIsActionLoading(true)
        await new Promise((r) => setTimeout(r, 2000))
        setIsActionLoading(false)
        refresh()
    }

    const handleDispute = async () => {
        setIsActionLoading(true)
        await new Promise((r) => setTimeout(r, 2000))
        setIsActionLoading(false)
        refresh()
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

                    {/* Escrow Content */}
                    {!isLoading && !error && escrow && (
                        <>
                            {/* Header */}
                            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="mb-2 flex items-center gap-3">
                                        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                                            Escrow Details
                                        </h1>
                                        <span
                                            className={`rounded-full border px-3 py-1 text-sm font-medium ${getStateColor(
                                                escrow.state
                                            )}`}
                                        >
                                            {getStateLabel(escrow.state)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/50">
                                        <span className="font-mono text-sm">{truncateAddress(escrow.address)}</span>
                                        <button
                                            onClick={() => copyToClipboard(escrow.address, "address")}
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
                                        You are the {userRole === "client" ? "Client" : "Freelancer"}
                                    </span>
                                )}
                            </div>

                            {/* STATE: AWAITING FUNDING - Client View */}
                            {escrow.state === "AWAITING_FUNDING" && userRole === "client" && (
                                <section className="mb-8 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 p-6 backdrop-blur-xl">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20">
                                            <Wallet className="h-5 w-5 text-yellow-400" />
                                        </div>
                                        <h2 className="text-lg font-bold text-white">Fund Escrow</h2>
                                    </div>

                                    <div className="mb-6 space-y-4">
                                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/50">
                                                Amount to Deposit
                                            </p>
                                            <p className="text-2xl font-bold text-white">
                                                {escrow.milestoneValue}{" "}
                                                <span className="text-base font-normal text-white/60">ETH</span>
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                            <p className="mb-2 text-sm font-medium text-white">What happens next:</p>
                                            <ul className="space-y-2 text-sm text-white/60">
                                                <li className="flex items-start gap-2">
                                                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                                                    Funds are locked in the escrow contract
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                                                    Freelancer can begin work immediately
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                                                    Funds released upon approval or auto-release after deadline
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleFundEscrow}
                                        disabled={isActionLoading}
                                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] disabled:opacity-50"
                                    >
                                        {isActionLoading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Confirming...
                                            </>
                                        ) : (
                                            <>
                                                <Wallet className="h-5 w-5" />
                                                Fund Escrow
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </button>
                                </section>
                            )}

                            {/* STATE: AWAITING FUNDING - Freelancer View */}
                            {escrow.state === "AWAITING_FUNDING" && userRole === "freelancer" && (
                                <section className="mb-8 rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                                            <Timer className="h-6 w-6 text-yellow-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">Waiting for Funding</h2>
                                            <p className="text-white/60">The client needs to fund the escrow before you can begin work.</p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* STATE: IN PROGRESS - Freelancer View */}
                            {escrow.state === "IN_PROGRESS" && userRole === "freelancer" && (
                                <section className="mb-8 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 p-6 backdrop-blur-xl">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                                            <Upload className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <h2 className="text-lg font-bold text-white">Submit Your Work</h2>
                                    </div>

                                    {/* Countdown */}
                                    <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-blue-400" />
                                                <span className="text-white/60">Time until deadline</span>
                                            </div>
                                            <span className={`text-lg font-bold ${escrow.deadline.getTime() - Date.now() < 24 * 60 * 60 * 1000
                                                    ? "text-red-400"
                                                    : "text-green-400"
                                                }`}>
                                                {formatTimeRemaining(escrow.deadline)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Evidence Upload */}
                                    <div className="mb-6">
                                        <label className="mb-2 block text-sm font-medium text-white/80">
                                            Evidence / Proof of Work
                                        </label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                                            <input
                                                type="text"
                                                placeholder="IPFS hash or URL to deliverable..."
                                                value={evidenceFile}
                                                onChange={(e) => setEvidenceFile(e.target.value)}
                                                className="w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSubmitWork}
                                        disabled={isActionLoading || !evidenceFile}
                                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-50"
                                    >
                                        {isActionLoading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-5 w-5" />
                                                Submit Work
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </button>
                                </section>
                            )}

                            {/* STATE: IN PROGRESS - Client View */}
                            {escrow.state === "IN_PROGRESS" && userRole === "client" && (
                                <section className="mb-8 rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                                            <Timer className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">Work In Progress</h2>
                                            <p className="text-white/60">The freelancer is working on the milestone. You'll be notified when work is submitted.</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-white/50">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm">{formatTimeRemaining(escrow.deadline)}</span>
                                    </div>
                                </section>
                            )}

                            {/* STATE: SUBMITTED - Freelancer View */}
                            {escrow.state === "SUBMITTED" && userRole === "freelancer" && (
                                <section className="mb-8 rounded-2xl border border-purple-500/30 bg-white/5 p-6 backdrop-blur-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                                            <CheckCircle2 className="h-6 w-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">Work Submitted</h2>
                                            <p className="text-white/60">Your submission is locked. Waiting for client approval.</p>
                                        </div>
                                    </div>
                                    {escrow.evidenceHash && (
                                        <div className="mt-4">
                                            <a
                                                href={`https://ipfs.io/ipfs/${escrow.evidenceHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                                            >
                                                View your submission <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* STATE: SUBMITTED - Client View */}
                            {escrow.state === "SUBMITTED" && userRole === "client" && (
                                <section className="mb-8 rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 p-6 backdrop-blur-xl">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
                                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        </div>
                                        <h2 className="text-lg font-bold text-white">Review Submission</h2>
                                    </div>

                                    {escrow.evidenceHash && (
                                        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                                            <p className="mb-2 text-sm text-white/60">Submitted Evidence:</p>
                                            <a
                                                href={`https://ipfs.io/ipfs/${escrow.evidenceHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                                            >
                                                <FileText className="h-4 w-4" />
                                                {escrow.evidenceHash}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <button
                                            onClick={handleApprove}
                                            disabled={isActionLoading}
                                            className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] disabled:opacity-50"
                                        >
                                            {isActionLoading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-5 w-5" />
                                                    Approve & Release Payment
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setShowDisputeWarning(true)}
                                            disabled={isActionLoading}
                                            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:opacity-50"
                                        >
                                            <Scale className="h-5 w-5" />
                                            Dispute Milestone
                                        </button>
                                    </div>

                                    {/* Dispute Warning Modal */}
                                    {showDisputeWarning && (
                                        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                                            <div className="mb-4 flex items-start gap-3">
                                                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                                                <div>
                                                    <p className="font-medium text-red-300">Dispute Warning</p>
                                                    <p className="mt-1 text-sm text-white/60">
                                                        Disputing requires posting a <strong className="text-white">30% bond ({escrow.bondValue} ETH)</strong>.
                                                        If you don't dispute, funds will auto-release to the freelancer after the deadline.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleDispute}
                                                    disabled={isActionLoading}
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300 transition-all hover:bg-red-500/30"
                                                >
                                                    {isActionLoading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>Confirm Dispute (Pay {escrow.bondValue} ETH)</>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setShowDisputeWarning(false)}
                                                    className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/60 hover:bg-white/5"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* A. Escrow Overview (Always Visible) */}
                            <section className="mb-8 rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                                            <Shield className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <h2 className="text-lg font-bold text-white">Escrow Overview</h2>
                                    </div>
                                    <button
                                        onClick={refresh}
                                        className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white/60 transition-all hover:bg-white/10 hover:text-white"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Refresh
                                    </button>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
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
                                                Milestone Value (V)
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-white">
                                            {escrow.milestoneValue}{" "}
                                            <span className="text-base font-normal text-white/60">ETH</span>
                                        </span>
                                    </div>

                                    {/* Bond Value */}
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-purple-400" />
                                            <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                                                Bond Value (30% of V)
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-white">
                                            {escrow.bondValue}{" "}
                                            <span className="text-base font-normal text-white/60">ETH</span>
                                        </span>
                                    </div>

                                    {/* Deadline */}
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-2">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-400" />
                                            <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                                                Deadline
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="text-lg font-semibold text-white">
                                                {escrow.deadline.toLocaleDateString("en-US", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                            <span
                                                className={`text-sm font-medium ${escrow.deadline.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
                                                    ? "text-red-400"
                                                    : "text-green-400"
                                                    }`}
                                            >
                                                {formatTimeRemaining(escrow.deadline)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Current State Details */}
                                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                                    <div className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
                                        Current State
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${getStateColor(
                                                escrow.state
                                            )}`}
                                        >
                                            {getStateLabel(escrow.state)}
                                        </span>
                                        {escrow.evidenceHash && (
                                            <a
                                                href={`https://ipfs.io/ipfs/${escrow.evidenceHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                                            >
                                                View Evidence
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Timeline */}
                            <section className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
                                <h2 className="mb-6 text-lg font-bold text-white">Timeline</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Escrow Created</p>
                                            <p className="text-sm text-white/50">
                                                {escrow.createdAt.toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {escrow.fundedAt && (
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">Escrow Funded</p>
                                                <p className="text-sm text-white/50">
                                                    {escrow.fundedAt.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {escrow.submittedAt && (
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">Work Submitted</p>
                                                <p className="text-sm text-white/50">
                                                    {escrow.submittedAt.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

