import MarketResolution from "@/components/market-resolution"

export const metadata = {
    title: "Resolution Summary | Paycheck",
    description: "View market resolution results and claim your winnings",
}

interface ResolutionPageProps {
    params: {
        id: string
    }
}

export default function ResolutionPage({ params }: ResolutionPageProps) {
    return <MarketResolution id={params.id} />
}
