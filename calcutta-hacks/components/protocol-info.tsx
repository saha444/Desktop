"use client"

import { useRouter } from "next/navigation"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import {
    ArrowLeft,
    Info,
    Shield,
    Coins,
    Scale,
    Users,
    Bot,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Lock,
    Zap,
    Clock,
    CheckCircle,
    XCircle,
    HelpCircle,
    ExternalLink,
    Layers,
    GitBranch,
} from "lucide-react"
import { useState } from "react"

interface AccordionItemProps {
    title: string
    icon: React.ReactNode
    children: React.ReactNode
    defaultOpen?: boolean
}

function AccordionItem({ title, icon, children, defaultOpen = false }: AccordionItemProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-5 text-left"
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="font-semibold text-white">{title}</span>
                </div>
                {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-white/60" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-white/60" />
                )}
            </button>
            {isOpen && (
                <div className="border-t border-white/10 p-5 pt-4">
                    {children}
                </div>
            )}
        </div>
    )
}

export default function ProtocolInfo() {
    const router = useRouter()

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden">
            <WebGLShader />

            <div className="relative z-10 min-h-screen px-4 py-8">
                <div className="mx-auto max-w-3xl">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="mb-6 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="mb-4 flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                <Info className="h-7 w-7 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                                    Protocol Information
                                </h1>
                                <p className="text-white/60">
                                    How Paycheck's Bond-Backed Resolution Market works
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Accordion Sections */}
                    <div className="space-y-4">
                        {/* How BRM Works */}
                        <AccordionItem
                            title="How Bond-Backed Resolution Market Works"
                            icon={<Scale className="h-5 w-5 text-purple-400" />}
                            defaultOpen={true}
                        >
                            <div className="space-y-4">
                                <p className="text-white/70">
                                    The Bond-Backed Resolution Market (BRM) is a decentralized dispute resolution system
                                    that ensures fair outcomes without relying on centralized arbitrators.
                                </p>

                                {/* Flow Diagram */}
                                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                    <h4 className="mb-3 font-medium text-white">Resolution Flow:</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">1</div>
                                            <div>
                                                <p className="font-medium text-white">Client Opens Dispute</p>
                                                <p className="text-sm text-white/60">Posts a 30% bond to open a dispute on the submitted work.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">2</div>
                                            <div>
                                                <p className="font-medium text-white">Freelancer Responds</p>
                                                <p className="text-sm text-white/60">Can accept loss, or challenge by matching the bond.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">3</div>
                                            <div>
                                                <p className="font-medium text-white">Market Opens</p>
                                                <p className="text-sm text-white/60">Community members deposit ETH on YES or NO outcomes.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">4</div>
                                            <div>
                                                <p className="font-medium text-white">Resolution</p>
                                                <p className="text-sm text-white/60">Outcome with most time-weighted capital wins. Winner-takes-all.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                                    <p className="text-sm text-blue-300">
                                        <strong>Key Insight:</strong> Early deposits receive higher time-weighting (up to 2x),
                                        rewarding those who research and commit early with greater influence on the outcome.
                                    </p>
                                </div>
                            </div>
                        </AccordionItem>

                        {/* Fee Structure */}
                        <AccordionItem
                            title="Fee Structure"
                            icon={<Coins className="h-5 w-5 text-green-400" />}
                        >
                            <div className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="mb-2 text-sm text-white/50">Dispute Bond</div>
                                        <div className="text-2xl font-bold text-yellow-400">30%</div>
                                        <p className="mt-1 text-xs text-white/50">of milestone value</p>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="mb-2 text-sm text-white/50">Protocol Fee</div>
                                        <div className="text-2xl font-bold text-purple-400">2.5%</div>
                                        <p className="mt-1 text-xs text-white/50">of disputed amount</p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                    <h4 className="mb-3 font-medium text-white">Fee Breakdown:</h4>
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-white/10">
                                            <tr>
                                                <td className="py-2 text-white/60">Escrow Creation</td>
                                                <td className="py-2 text-right font-medium text-green-400">Free</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 text-white/60">Funding Escrow</td>
                                                <td className="py-2 text-right font-medium text-green-400">Gas only</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 text-white/60">Submitting Work</td>
                                                <td className="py-2 text-right font-medium text-green-400">Gas only</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 text-white/60">Opening Dispute</td>
                                                <td className="py-2 text-right font-medium text-yellow-400">30% bond</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 text-white/60">Challenging Dispute</td>
                                                <td className="py-2 text-right font-medium text-yellow-400">30% bond</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 text-white/60">Dispute Resolution</td>
                                                <td className="py-2 text-right font-medium text-purple-400">2.5% fee</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                                    <p className="text-sm text-green-300">
                                        <strong>No fees on successful escrows!</strong> Protocol fees only apply when disputes
                                        go to market resolution. Most escrows complete without disputes.
                                    </p>
                                </div>
                            </div>
                        </AccordionItem>

                        {/* Security Assumptions */}
                        <AccordionItem
                            title="Security Assumptions"
                            icon={<Shield className="h-5 w-5 text-blue-400" />}
                        >
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                                        <div>
                                            <p className="font-medium text-white">Smart Contract Security</p>
                                            <p className="text-sm text-white/60">
                                                All contracts are audited and open-source. Funds are held in non-custodial escrow.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                                        <div>
                                            <p className="font-medium text-white">Economic Security</p>
                                            <p className="text-sm text-white/60">
                                                Bonds make frivolous disputes expensive. Bad actors lose their stake.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                                        <div>
                                            <p className="font-medium text-white">Decentralized Resolution</p>
                                            <p className="text-sm text-white/60">
                                                No single party controls outcomes. Market consensus determines truth.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                                    <h4 className="mb-2 flex items-center gap-2 font-medium text-yellow-300">
                                        <AlertTriangle className="h-4 w-4" />
                                        Known Limitations
                                    </h4>
                                    <ul className="space-y-2 text-sm text-white/70">
                                        <li className="flex items-start gap-2">
                                            <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                                            Markets can be manipulated by well-capitalized actors (Sybil attacks)
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                                            Low liquidity markets may produce unreliable outcomes
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                                            Complex technical disputes may be hard for markets to evaluate
                                        </li>
                                    </ul>
                                </div>

                                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                                    <p className="text-sm text-white/60">
                                        <strong className="text-white">Mitigation:</strong> We recommend using Paycheck for clear,
                                        well-defined milestones with objective deliverables that the community can easily verify.
                                    </p>
                                </div>
                            </div>
                        </AccordionItem>

                        {/* What AI Does & Doesn't Do */}
                        <AccordionItem
                            title="What AI Does & Doesn't Do"
                            icon={<Bot className="h-5 w-5 text-cyan-400" />}
                        >
                            <div className="space-y-4">
                                {/* What AI Does */}
                                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                                    <h4 className="mb-3 flex items-center gap-2 font-medium text-green-300">
                                        <CheckCircle className="h-4 w-4" />
                                        What AI CAN Do
                                    </h4>
                                    <ul className="space-y-2 text-sm text-white/70">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                                            Analyze submitted evidence (code, documents, screenshots)
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                                            Provide an objective assessment summary
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                                            Highlight key facts for market participants
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                                            Detect obvious inconsistencies or missing deliverables
                                        </li>
                                    </ul>
                                </div>

                                {/* What AI Doesn't Do */}
                                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                                    <h4 className="mb-3 flex items-center gap-2 font-medium text-red-300">
                                        <XCircle className="h-4 w-4" />
                                        What AI CANNOT Do
                                    </h4>
                                    <ul className="space-y-2 text-sm text-white/70">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                                            <strong className="text-white">Vote in the resolution market</strong> — AI has zero voting power
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                                            <strong className="text-white">Override market outcomes</strong> — Decisions are final
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                                            <strong className="text-white">Access private data</strong> — Only sees submitted evidence
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                                            <strong className="text-white">Decide disputes autonomously</strong> — Humans always decide
                                        </li>
                                    </ul>
                                </div>

                                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3">
                                    <p className="text-sm text-cyan-300">
                                        <strong>Bottom Line:</strong> AI is an analysis tool, not a decision maker.
                                        The community's capital-weighted votes determine all outcomes.
                                        AI cannot spend, vote, or override anything.
                                    </p>
                                </div>
                            </div>
                        </AccordionItem>

                        {/* Time-Weighted Capital */}
                        <AccordionItem
                            title="Time-Weighted Capital Explained"
                            icon={<Clock className="h-5 w-5 text-yellow-400" />}
                        >
                            <div className="space-y-4">
                                <p className="text-white/70">
                                    Deposits made earlier in the market period receive higher weighting,
                                    incentivizing thorough research before committing capital.
                                </p>

                                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                    <h4 className="mb-3 font-medium text-white">Multiplier Formula:</h4>
                                    <div className="rounded-lg bg-black/30 p-3 font-mono text-sm text-green-400">
                                        multiplier = 1 + (time_remaining / total_duration)
                                    </div>
                                    <ul className="mt-3 space-y-1 text-sm text-white/60">
                                        <li>• Deposit at start: <strong className="text-yellow-400">2.0x</strong> weight</li>
                                        <li>• Deposit at halfway: <strong className="text-yellow-400">1.5x</strong> weight</li>
                                        <li>• Deposit at end: <strong className="text-yellow-400">1.0x</strong> weight</li>
                                    </ul>
                                </div>

                                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                                    <p className="text-sm text-white/60">
                                        <strong className="text-white">Why?</strong> This prevents last-minute manipulation
                                        and rewards participants who do their research early.
                                    </p>
                                </div>
                            </div>
                        </AccordionItem>

                        {/* Auto-Release Rules */}
                        <AccordionItem
                            title="Auto-Release Rules"
                            icon={<Zap className="h-5 w-5 text-orange-400" />}
                        >
                            <div className="space-y-4">
                                <p className="text-white/70">
                                    Automatic fund release ensures neither party can stall indefinitely.
                                </p>

                                <div className="space-y-3">
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <h4 className="mb-2 font-medium text-white">Scenario 1: No Dispute</h4>
                                        <p className="text-sm text-white/60">
                                            If client doesn't approve or dispute within <strong className="text-white">7 days</strong> of submission,
                                            funds auto-release to the freelancer.
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <h4 className="mb-2 font-medium text-white">Scenario 2: Dispute Not Challenged</h4>
                                        <p className="text-sm text-white/60">
                                            If freelancer doesn't respond to dispute within <strong className="text-white">72 hours</strong>,
                                            client wins by default and receives escrow + bond back.
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <h4 className="mb-2 font-medium text-white">Scenario 3: Market Complete</h4>
                                        <p className="text-sm text-white/60">
                                            Market resolves after <strong className="text-white">48-hour</strong> voting period.
                                            Payouts available immediately.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </AccordionItem>

                        {/* FAQ */}
                        <AccordionItem
                            title="Frequently Asked Questions"
                            icon={<HelpCircle className="h-5 w-5 text-pink-400" />}
                        >
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium text-white">Can I get my bond back if I lose?</p>
                                    <p className="mt-1 text-sm text-white/60">
                                        No. If you lose the dispute, your bond goes to the winning party.
                                        Bonds exist to deter frivolous disputes.
                                    </p>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <p className="font-medium text-white">What if no one participates in the market?</p>
                                    <p className="mt-1 text-sm text-white/60">
                                        Markets have a minimum participation threshold. If not met, both parties
                                        receive their original stakes back minus gas fees.
                                    </p>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <p className="font-medium text-white">Can market outcomes be appealed?</p>
                                    <p className="mt-1 text-sm text-white/60">
                                        No. Market outcomes are final and on-chain. This is by design—finality
                                        ensures predictability and trust in the system.
                                    </p>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <p className="font-medium text-white">Is my wallet data private?</p>
                                    <p className="mt-1 text-sm text-white/60">
                                        Paycheck never has access to your private keys. All transactions are
                                        standard Ethereum transactions signed by your wallet.
                                    </p>
                                </div>
                            </div>
                        </AccordionItem>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
                        <a
                            href="https://github.com/saha444/paycheck_frontend"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-white/60 hover:text-white"
                        >
                            <GitBranch className="h-4 w-4" />
                            View Source Code
                            <ExternalLink className="h-3 w-3" />
                        </a>
                        <a
                            href="https://sepolia.etherscan.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-white/60 hover:text-white"
                        >
                            <Layers className="h-4 w-4" />
                            Contract on Etherscan
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
