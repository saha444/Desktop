import DisputeMarket from "@/components/dispute-market"

export const metadata = {
    title: "Resolution Market | Paycheck",
    description: "Community-driven dispute resolution through prediction markets",
}

interface DisputePageProps {
    params: {
        id: string
    }
}

export default function DisputePage({ params }: DisputePageProps) {
    return <DisputeMarket id={params.id} />
}
