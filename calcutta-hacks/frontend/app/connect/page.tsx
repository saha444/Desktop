import ConnectWallet from "@/components/connect-wallet"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export const metadata = {
    title: "Connect Wallet | Paycheck",
    description: "Connect your wallet to access Paycheck - Your identity is your wallet address",
}

function LoadingFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
    )
}

export default function ConnectPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ConnectWallet />
        </Suspense>
    )
}
