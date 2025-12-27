"use client"

import { useWallet } from "@/hooks/useWallet"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { Wallet, AlertTriangle, CheckCircle2, Copy, ExternalLink, ArrowRight, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ConnectWallet() {
    const router = useRouter()
    const {
        isConnected,
        address,
        chainId,
        isCorrectNetwork,
        isLoading,
        error,
        connect,
        disconnect,
        switchToSepolia,
    } = useWallet()

    const [copied, setCopied] = useState(false)
    const [hasMetaMask, setHasMetaMask] = useState(true)

    useEffect(() => {
        setHasMetaMask(typeof window !== "undefined" && !!window.ethereum)
    }, [])

    const truncateAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    const copyAddress = async () => {
        if (address) {
            await navigator.clipboard.writeText(address)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleContinue = () => {
        if (isConnected && isCorrectNetwork) {
            router.push("/dashboard")
        }
    }

    const getNetworkName = (id: number | null) => {
        if (!id) return "Unknown"
        const networks: Record<number, string> = {
            1: "Ethereum Mainnet",
            11155111: "Sepolia Testnet",
            137: "Polygon",
            80001: "Mumbai",
        }
        return networks[id] || `Chain ${id}`
    }

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden">
            <WebGLShader />

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                            Connect Wallet
                        </h1>
                        <p className="text-white/70">
                            Your wallet address is your identity. No signup required.
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur-xl">
                        {/* Error Display */}
                        {error && (
                            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {!isConnected ? (
                            /* Wallet Selection */
                            <div className="space-y-4">
                                <p className="mb-4 text-center text-sm text-white/60">
                                    Select a wallet to connect
                                </p>

                                {/* MetaMask Button */}
                                <button
                                    onClick={connect}
                                    disabled={isLoading || !hasMetaMask}
                                    className="group relative flex w-full items-center justify-between rounded-xl border border-white/20 bg-white/5 p-4 transition-all hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600">
                                            <svg className="h-7 w-7" viewBox="0 0 35 33" fill="none">
                                                <path d="M32.9582 1L19.5582 10.8165L21.9902 5.00641L32.9582 1Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M2.0332 1L15.3232 10.9082L13.0012 5.00641L2.0332 1Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M28.2132 23.5334L24.7332 28.8725L32.2182 30.9307L34.3682 23.6507L28.2132 23.5334Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M0.640625 23.6507L2.78062 30.9307L10.2656 28.8725L6.78563 23.5334L0.640625 23.6507Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M9.87813 14.6123L7.79688 17.7723L15.2319 18.1052L14.9669 10.1221L9.87813 14.6123Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M25.1133 14.6123L19.9633 10.0298L19.7583 18.1052L27.1933 17.7723L25.1133 14.6123Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M10.2656 28.8724L14.7656 26.6969L10.8556 23.7019L10.2656 28.8724Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M20.2266 26.6969L24.7366 28.8724L24.1366 23.7019L20.2266 26.6969Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-white">MetaMask</p>
                                            <p className="text-sm text-white/60">
                                                {hasMetaMask ? "Connect to your wallet" : "Not installed"}
                                            </p>
                                        </div>
                                    </div>
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-white/60" />
                                    ) : (
                                        <ArrowRight className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                                    )}
                                </button>

                                {/* WalletConnect Button (Coming Soon) */}
                                <button
                                    disabled
                                    className="group relative flex w-full cursor-not-allowed items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 opacity-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600">
                                            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="white">
                                                <path d="M6.09 10.37c3.26-3.19 8.54-3.19 11.8 0l.39.38a.4.4 0 010 .58l-1.34 1.31a.21.21 0 01-.3 0l-.54-.53c-2.27-2.22-5.96-2.22-8.23 0l-.58.56a.21.21 0 01-.3 0L5.65 11.36a.4.4 0 010-.58l.44-.41zm14.57 2.71l1.2 1.17a.4.4 0 010 .58l-5.4 5.28a.42.42 0 01-.59 0l-3.83-3.75a.1.1 0 00-.15 0l-3.83 3.75a.42.42 0 01-.59 0l-5.4-5.28a.4.4 0 010-.58l1.2-1.17a.42.42 0 01.59 0l3.83 3.75a.1.1 0 00.15 0l3.83-3.75a.42.42 0 01.59 0l3.83 3.75a.1.1 0 00.15 0l3.83-3.75a.42.42 0 01.59 0z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-white">WalletConnect</p>
                                            <p className="text-sm text-white/60">Coming soon</p>
                                        </div>
                                    </div>
                                </button>

                                {!hasMetaMask && (
                                    <a
                                        href="https://metamask.io/download/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                                    >
                                        Install MetaMask
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        ) : (
                            /* Connected State */
                            <div className="space-y-6">
                                {/* Network Status */}
                                <div
                                    className={`flex items-center justify-between rounded-xl border p-4 ${isCorrectNetwork
                                            ? "border-green-500/30 bg-green-500/10"
                                            : "border-red-500/30 bg-red-500/10"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {isCorrectNetwork ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        ) : (
                                            <AlertTriangle className="h-5 w-5 text-red-400" />
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium ${isCorrectNetwork ? "text-green-300" : "text-red-300"}`}>
                                                {isCorrectNetwork ? "Connected to Sepolia" : "Wrong Network"}
                                            </p>
                                            <p className="text-xs text-white/60">
                                                {getNetworkName(chainId)}
                                            </p>
                                        </div>
                                    </div>
                                    {!isCorrectNetwork && (
                                        <button
                                            onClick={switchToSepolia}
                                            disabled={isLoading}
                                            className="rounded-lg bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/30 disabled:opacity-50"
                                        >
                                            {isLoading ? "Switching..." : "Switch"}
                                        </button>
                                    )}
                                </div>

                                {/* Address Preview */}
                                <div className="rounded-xl border border-white/20 bg-white/5 p-4">
                                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
                                        Your Wallet
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                                                <Wallet className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="font-mono text-lg text-white">
                                                {address && truncateAddress(address)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={copyAddress}
                                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                                        >
                                            {copied ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handleContinue}
                                        disabled={!isCorrectNetwork}
                                        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 p-[1px] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center justify-center gap-2 rounded-xl bg-black/50 px-6 py-4 font-semibold text-white backdrop-blur-xl transition-all group-hover:bg-black/30">
                                            Continue
                                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </button>

                                    <button
                                        onClick={disconnect}
                                        className="w-full rounded-xl border border-white/10 px-6 py-3 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white"
                                    >
                                        Disconnect Wallet
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Note */}
                    <p className="mt-6 text-center text-sm text-white/50">
                        By connecting, you agree to our Terms of Service
                    </p>
                </div>
            </div>
        </div>
    )
}
