"use client"

import { useRouter } from "next/navigation"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { useWallet } from "@/hooks/useWallet"
import {
    useCreateEscrow,
    CreateEscrowStep,
    RiskLevel,
} from "@/hooks/useCreateEscrow"
import {
    ArrowRight,
    ArrowLeft,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    Shield,
    Sparkles,
    FileText,
    Wallet,
    Clock,
    AlertCircle,
    Fuel,
    Check,
} from "lucide-react"
import { useEffect, useState } from "react"

// Step indicator component
function StepIndicator({ step, currentStep }: { step: number; currentStep: number }) {
    const isActive = step === currentStep
    const isComplete = step < currentStep

    return (
        <div className="flex items-center">
            <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${isComplete
                    ? "border-green-500 bg-green-500/20 text-green-400"
                    : isActive
                        ? "border-purple-500 bg-purple-500/20 text-purple-400"
                        : "border-white/20 bg-white/5 text-white/40"
                    }`}
            >
                {isComplete ? <Check className="h-5 w-5" /> : step}
            </div>
        </div>
    )
}

// Risk level badge
function RiskBadge({ level }: { level: RiskLevel }) {
    const styles = {
        LOW: "border-green-500/30 bg-green-500/20 text-green-300",
        MEDIUM: "border-yellow-500/30 bg-yellow-500/20 text-yellow-300",
        HIGH: "border-red-500/30 bg-red-500/20 text-red-300",
    }

    return (
        <span className={`rounded-full border px-4 py-1 text-sm font-medium ${styles[level]}`}>
            {level} RISK
        </span>
    )
}

export default function CreateEscrow() {
    const router = useRouter()
    const { isConnected, address, isInitialized } = useWallet()
    const {
        currentStep,
        setStep,
        canProceed,
        formData,
        updateFormData,
        formErrors,
        validateForm,
        riskScan,
        isScanning,
        acknowledgedRisks,
        setAcknowledgedRisks,
        isDeploying,
        deployError,
        gasEstimate,
        deployEscrow,
    } = useCreateEscrow()

    const [deploySuccess, setDeploySuccess] = useState<string | null>(null)

    // Redirect to connect if not connected (only after initialized)
    useEffect(() => {
        if (isInitialized && !isConnected) {
            router.push("/connect")
        }
    }, [isConnected, isInitialized, router])

    const handleNext = async () => {
        if (currentStep === 1) {
            if (validateForm()) {
                setStep(2)
            }
        } else if (currentStep === 2) {
            setStep(3)
        } else if (currentStep === 3) {
            const escrowAddress = await deployEscrow()
            if (escrowAddress) {
                setDeploySuccess(escrowAddress)
                setTimeout(() => {
                    router.push(`/escrow/${escrowAddress}`)
                }, 2000)
            }
        }
    }

    // Show loading while wallet initializes
    if (!isInitialized) {
        return (
            <div className="relative min-h-screen w-full overflow-x-hidden">
                <WebGLShader />
                <div className="relative z-10 flex min-h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white/60" />
                </div>
            </div>
        )
    }

    if (!isConnected) {
        return null
    }

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden">
            <WebGLShader />

            <div className="relative z-10 min-h-screen px-4 py-8">
                <div className="mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                            Create Escrow
                        </h1>
                        <p className="text-white/60">
                            Define clear terms to prevent disputes
                        </p>
                    </div>

                    {/* Step Indicators */}
                    <div className="mb-8 flex items-center justify-center gap-4">
                        <StepIndicator step={1} currentStep={currentStep} />
                        <div className={`h-0.5 w-12 ${currentStep > 1 ? "bg-green-500" : "bg-white/20"}`} />
                        <StepIndicator step={2} currentStep={currentStep} />
                        <div className={`h-0.5 w-12 ${currentStep > 2 ? "bg-green-500" : "bg-white/20"}`} />
                        <StepIndicator step={3} currentStep={currentStep} />
                    </div>

                    {/* Step Labels */}
                    <div className="mb-8 flex justify-between text-xs text-white/50">
                        <span className={currentStep === 1 ? "text-purple-400" : ""}>Define Milestone</span>
                        <span className={currentStep === 2 ? "text-purple-400" : ""}>AI Risk Scan</span>
                        <span className={currentStep === 3 ? "text-purple-400" : ""}>Deploy</span>
                    </div>

                    {/* Main Card */}
                    <div className="rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur-xl">
                        {/* Step 1: Define Milestone */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                                        <FileText className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Define Milestone</h2>
                                </div>

                                {/* Counterparty Address */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-white/80">
                                        Freelancer Wallet Address
                                    </label>
                                    <div className="relative">
                                        <Wallet className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                                        <input
                                            type="text"
                                            placeholder="0x..."
                                            value={formData.counterpartyAddress}
                                            onChange={(e) => updateFormData({ counterpartyAddress: e.target.value })}
                                            className={`w-full rounded-xl border bg-white/5 py-3 pl-12 pr-4 font-mono text-sm text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 ${formErrors.counterpartyAddress
                                                ? "border-red-500/50 focus:ring-red-500/50"
                                                : "border-white/20 focus:border-purple-500/50 focus:ring-purple-500/50"
                                                }`}
                                        />
                                    </div>
                                    {formErrors.counterpartyAddress && (
                                        <p className="mt-1 text-sm text-red-400">{formErrors.counterpartyAddress}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-white/80">
                                        Milestone Description
                                    </label>
                                    <textarea
                                        placeholder="Describe the deliverables, requirements, and acceptance criteria..."
                                        value={formData.description}
                                        onChange={(e) => updateFormData({ description: e.target.value })}
                                        rows={4}
                                        className={`w-full rounded-xl border bg-white/5 p-4 text-sm text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 ${formErrors.description
                                            ? "border-red-500/50 focus:ring-red-500/50"
                                            : "border-white/20 focus:border-purple-500/50 focus:ring-purple-500/50"
                                            }`}
                                    />
                                    {formErrors.description && (
                                        <p className="mt-1 text-sm text-red-400">{formErrors.description}</p>
                                    )}
                                </div>

                                {/* Deadline */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-white/80">
                                        Deadline
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                                        <input
                                            type="datetime-local"
                                            value={formData.deadline}
                                            onChange={(e) => updateFormData({ deadline: e.target.value })}
                                            className={`w-full rounded-xl border bg-white/5 py-3 pl-12 pr-4 text-sm text-white transition-all focus:outline-none focus:ring-2 ${formErrors.deadline
                                                ? "border-red-500/50 focus:ring-red-500/50"
                                                : "border-white/20 focus:border-purple-500/50 focus:ring-purple-500/50"
                                                }`}
                                        />
                                    </div>
                                    {formErrors.deadline && (
                                        <p className="mt-1 text-sm text-red-400">{formErrors.deadline}</p>
                                    )}
                                </div>

                                {/* Milestone Value */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-white/80">
                                        Milestone Value (ETH)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">Ξ</span>
                                        <input
                                            type="number"
                                            step="0.001"
                                            placeholder="0.00"
                                            value={formData.milestoneValue}
                                            onChange={(e) => updateFormData({ milestoneValue: e.target.value })}
                                            className={`w-full rounded-xl border bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 transition-all focus:outline-none focus:ring-2 ${formErrors.milestoneValue
                                                ? "border-red-500/50 focus:ring-red-500/50"
                                                : "border-white/20 focus:border-purple-500/50 focus:ring-purple-500/50"
                                                }`}
                                        />
                                    </div>
                                    {formErrors.milestoneValue && (
                                        <p className="mt-1 text-sm text-red-400">{formErrors.milestoneValue}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: AI Risk Scan */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                                        <Sparkles className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">AI Risk Scan</h2>
                                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                                        Axicov
                                    </span>
                                </div>

                                {isScanning ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="mb-4 h-12 w-12 animate-spin text-purple-400" />
                                        <p className="text-white/60">Analyzing milestone for potential risks...</p>
                                    </div>
                                ) : riskScan ? (
                                    <>
                                        {/* Risk Score Card */}
                                        <div className="rounded-xl border border-white/20 bg-white/5 p-6">
                                            <div className="mb-4 flex items-center justify-between">
                                                <span className="text-sm text-white/60">Risk Assessment</span>
                                                <RiskBadge level={riskScan.riskLevel} />
                                            </div>
                                            <div className="mb-2 h-3 overflow-hidden rounded-full bg-white/10">
                                                <div
                                                    className={`h-full transition-all ${riskScan.riskLevel === "LOW"
                                                        ? "bg-green-500"
                                                        : riskScan.riskLevel === "MEDIUM"
                                                            ? "bg-yellow-500"
                                                            : "bg-red-500"
                                                        }`}
                                                    style={{ width: `${riskScan.score}%` }}
                                                />
                                            </div>
                                            <p className="text-sm text-white/50">
                                                Risk Score: {riskScan.score}/100
                                            </p>
                                        </div>

                                        {/* Flagged Issues */}
                                        {riskScan.issues.length > 0 && (
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-medium text-white/80">Flagged Issues</h3>
                                                {riskScan.issues.map((issue) => (
                                                    <div
                                                        key={issue.id}
                                                        className={`rounded-xl border p-4 ${issue.type === "error"
                                                            ? "border-red-500/30 bg-red-500/10"
                                                            : "border-yellow-500/30 bg-yellow-500/10"
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <AlertCircle
                                                                className={`mt-0.5 h-5 w-5 flex-shrink-0 ${issue.type === "error"
                                                                    ? "text-red-400"
                                                                    : "text-yellow-400"
                                                                    }`}
                                                            />
                                                            <div>
                                                                <p className={`font-medium ${issue.type === "error" ? "text-red-300" : "text-yellow-300"
                                                                    }`}>
                                                                    {issue.title}
                                                                </p>
                                                                <p className="mt-1 text-sm text-white/60">
                                                                    {issue.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {riskScan.issues.length === 0 && (
                                            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                                    <p className="text-green-300">No significant issues detected</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Warning Banner */}
                                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                                                <div>
                                                    <p className="font-medium text-yellow-300">AI Advice Only</p>
                                                    <p className="mt-1 text-sm text-white/60">
                                                        This is an automated assessment. You are responsible for reviewing the terms and proceeding.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Acknowledge Checkbox */}
                                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/20 bg-white/5 p-4 transition-all hover:bg-white/10">
                                            <input
                                                type="checkbox"
                                                checked={acknowledgedRisks}
                                                onChange={(e) => setAcknowledgedRisks(e.target.checked)}
                                                className="h-5 w-5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                                            />
                                            <span className="text-sm text-white">
                                                I acknowledge the risks and wish to proceed
                                            </span>
                                        </label>
                                    </>
                                ) : null}
                            </div>
                        )}

                        {/* Step 3: Deploy Escrow */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
                                        <Shield className="h-5 w-5 text-green-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Deploy Escrow</h2>
                                </div>

                                {deploySuccess ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                                            <CheckCircle2 className="h-8 w-8 text-green-400" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-bold text-white">Escrow Created!</h3>
                                        <p className="mb-4 text-center text-white/60">
                                            Redirecting to escrow details...
                                        </p>
                                        <p className="font-mono text-sm text-white/50">
                                            {deploySuccess.slice(0, 20)}...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Summary */}
                                        <div className="space-y-4 rounded-xl border border-white/20 bg-white/5 p-6">
                                            <h3 className="text-sm font-medium uppercase tracking-wider text-white/50">
                                                Summary
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Freelancer</span>
                                                    <span className="font-mono text-sm text-white">
                                                        {formData.counterpartyAddress.slice(0, 10)}...
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Milestone Value</span>
                                                    <span className="font-bold text-white">
                                                        {formData.milestoneValue} ETH
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Deadline</span>
                                                    <span className="text-white">
                                                        {new Date(formData.deadline).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Gas Estimate */}
                                        <div className="flex items-center justify-between rounded-xl border border-white/20 bg-white/5 p-4">
                                            <div className="flex items-center gap-3">
                                                <Fuel className="h-5 w-5 text-white/40" />
                                                <span className="text-white/60">Estimated Gas</span>
                                            </div>
                                            <span className="font-mono text-white">~{gasEstimate} ETH</span>
                                        </div>

                                        {/* Deploy Error */}
                                        {deployError && (
                                            <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                                                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                                <p className="text-sm">{deployError}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        {!deploySuccess && (
                            <div className="mt-8 flex gap-4">
                                {currentStep > 1 && (
                                    <button
                                        onClick={() => setStep((currentStep - 1) as CreateEscrowStep)}
                                        className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-medium text-white transition-all hover:bg-white/10"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceed || isDeploying}
                                    className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isDeploying ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Deploying...
                                        </>
                                    ) : currentStep === 3 ? (
                                        <>
                                            Deploy Escrow
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    ) : currentStep === 2 ? (
                                        <>
                                            Acknowledge Risks & Continue
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    ) : (
                                        <>
                                            Continue
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
