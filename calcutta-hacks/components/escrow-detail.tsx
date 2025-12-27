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
