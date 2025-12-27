import EscrowResolved from "@/components/escrow-resolved"

export const metadata = {
    title: "Resolved Escrow | Paycheck",
    description: "View resolved escrow details and transaction history",
}

interface ResolvedPageProps {
    params: {
        address: string
    }
}

export default function ResolvedPage({ params }: ResolvedPageProps) {
    return <EscrowResolved address={params.address} />
}
