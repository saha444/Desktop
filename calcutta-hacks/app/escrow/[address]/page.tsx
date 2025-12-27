import EscrowDetail from "@/components/escrow-detail"

export const metadata = {
    title: "Escrow Details | Paycheck",
    description: "View escrow details, status, and available actions",
}

interface EscrowPageProps {
    params: {
        address: string
    }
}

export default function EscrowPage({ params }: EscrowPageProps) {
    return <EscrowDetail address={params.address} />
}
