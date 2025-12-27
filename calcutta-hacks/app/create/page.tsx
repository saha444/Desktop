import CreateEscrow from "@/components/create-escrow"

export const metadata = {
    title: "Create Escrow | Paycheck",
    description: "Create a new secure escrow with milestone-based payments",
}

export default function CreatePage() {
    return <CreateEscrow />
}
