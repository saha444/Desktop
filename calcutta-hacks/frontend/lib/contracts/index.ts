import { ethers, BrowserProvider, Contract } from "ethers";
import deploymentData from "./deployment-sepolia.json";

// Extract ABIs from deployment data
const EscrowContractABI = deploymentData.contracts.EscrowContract.abi;
const DisputeModuleABI = deploymentData.contracts.DisputeModule.abi;

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
    // Sepolia testnet addresses (from deployment)
    sepolia: {
        disputeModule: deploymentData.contracts.DisputeModule.address,
        protocol: deploymentData.deployer,
    },
    // Mainnet addresses (update after deploying)
    mainnet: {
        disputeModule: "",
        protocol: "",
    },
    // Local hardhat (from deployment)
    hardhat: {
        disputeModule: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        protocol: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    },
};

// Re-export ABIs
export { EscrowContractABI, DisputeModuleABI };

// Types
export interface EscrowDetails {
    client: string;
    freelancer: string;
    milestoneValue: bigint;
    bondValue: bigint;
    state: number;
    createdAt: bigint;
    fundedAt: bigint;
    submittedAt: bigint;
    evidenceHash: string;
}

export interface DisputeDetails {
    escrowContract: string;
    state: number;
    clientBond: bigint;
    freelancerBond: bigint;
    clientBondPosted: boolean;
    freelancerBondPosted: boolean;
    votingStartTime: bigint;
    votingEndTime: bigint;
    totalStakedForFreelancer: bigint;
    totalStakedForClient: bigint;
    outcome: number;
    resolvedAt: bigint;
}

export enum EscrowState {
    CREATED = 0,
    FUNDED = 1,
    SUBMITTED = 2,
    APPROVED = 3,
    DISPUTE_OPEN = 4,
    DISPUTE_ACTIVE = 5,
    RESOLVED = 6,
}

export enum DisputeState {
    NONE = 0,
    OPEN = 1,
    ACTIVE = 2,
    RESOLVED = 3,
}

export enum Vote {
    NONE = 0,
    FREELANCER = 1,
    CLIENT = 2,
}

/**
 * Get the current network name based on chain ID
 */
export async function getNetworkName(provider: BrowserProvider): Promise<string> {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    switch (chainId) {
        case 1: return "mainnet";
        case 11155111: return "sepolia";
        case 31337: return "hardhat";
        default: return "unknown";
    }
}

/**
 * Get contract addresses for the current network
 */
export async function getContractAddresses(provider: BrowserProvider) {
    const networkName = await getNetworkName(provider);
    return CONTRACT_ADDRESSES[networkName as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES.hardhat;
}

/**
 * Get the DisputeModule contract instance
 */
export async function getDisputeModule(provider: BrowserProvider): Promise<Contract> {
    const signer = await provider.getSigner();
    const addresses = await getContractAddresses(provider);

    return new Contract(addresses.disputeModule, DisputeModuleABI, signer);
}

/**
 * Create a new EscrowContract instance for an existing escrow
 */
export function getEscrowContract(escrowAddress: string, signer: ethers.Signer): Contract {
    return new Contract(escrowAddress, EscrowContractABI, signer);
}

/**
 * Deploy a new Escrow contract
 */
export async function createEscrow(
    provider: BrowserProvider,
    freelancerAddress: string,
    milestoneValueEth: string
): Promise<string> {
    const signer = await provider.getSigner();
    const addresses = await getContractAddresses(provider);

    const milestoneValue = ethers.parseEther(milestoneValueEth);

    // Deploy new escrow contract
    const EscrowFactory = new ethers.ContractFactory(
        EscrowContractABI,
        // You need to get the bytecode from compilation
        // For now, this is a placeholder - see note below
        "0x",
        signer
    );

    const escrow = await EscrowFactory.deploy(
        freelancerAddress,
        milestoneValue,
        addresses.protocol
    );

    await escrow.waitForDeployment();
    return await escrow.getAddress();
}

/**
 * Fund an escrow with the milestone amount
 */
export async function fundEscrow(
    provider: BrowserProvider,
    escrowAddress: string,
    milestoneValueEth: string
): Promise<ethers.TransactionResponse> {
    const signer = await provider.getSigner();
    const escrow = getEscrowContract(escrowAddress, signer);

    return escrow.fund({ value: ethers.parseEther(milestoneValueEth) });
}

/**
 * Submit work evidence to an escrow
 */
export async function submitWork(
    provider: BrowserProvider,
    escrowAddress: string,
    evidenceHash: string
): Promise<ethers.TransactionResponse> {
    const signer = await provider.getSigner();
    const escrow = getEscrowContract(escrowAddress, signer);

    return escrow.submit(evidenceHash);
}

/**
 * Approve work and release payment
 */
export async function approveWork(
    provider: BrowserProvider,
    escrowAddress: string
): Promise<ethers.TransactionResponse> {
    const signer = await provider.getSigner();
    const escrow = getEscrowContract(escrowAddress, signer);

    return escrow.approve();
}

/**
 * Open a dispute for an escrow
 */
export async function openDispute(
    provider: BrowserProvider,
    escrowAddress: string
): Promise<ethers.TransactionResponse> {
    const disputeModule = await getDisputeModule(provider);
    return disputeModule.openDispute(escrowAddress);
}

/**
 * Post bond for a dispute
 */
export async function postBond(
    provider: BrowserProvider,
    disputeId: number,
    bondValueEth: string
): Promise<ethers.TransactionResponse> {
    const disputeModule = await getDisputeModule(provider);
    return disputeModule.postBond(disputeId, { value: ethers.parseEther(bondValueEth) });
}

/**
 * Cast a vote on a dispute
 */
export async function voteOnDispute(
    provider: BrowserProvider,
    disputeId: number,
    vote: Vote,
    stakeValueEth: string
): Promise<ethers.TransactionResponse> {
    const disputeModule = await getDisputeModule(provider);
    return disputeModule.vote(disputeId, vote, { value: ethers.parseEther(stakeValueEth) });
}

/**
 * Resolve a dispute after voting ends
 */
export async function resolveDispute(
    provider: BrowserProvider,
    disputeId: number
): Promise<ethers.TransactionResponse> {
    const disputeModule = await getDisputeModule(provider);
    return disputeModule.resolveDispute(disputeId);
}

/**
 * Claim rewards after a dispute is resolved
 */
export async function claimRewards(
    provider: BrowserProvider,
    disputeId: number
): Promise<ethers.TransactionResponse> {
    const disputeModule = await getDisputeModule(provider);
    return disputeModule.claimRewards(disputeId);
}

/**
 * Get escrow details
 */
export async function getEscrowDetails(
    provider: BrowserProvider,
    escrowAddress: string
): Promise<EscrowDetails> {
    const signer = await provider.getSigner();
    const escrow = getEscrowContract(escrowAddress, signer);

    const details = await escrow.getEscrowDetails();
    return {
        client: details[0],
        freelancer: details[1],
        milestoneValue: details[2],
        bondValue: details[3],
        state: Number(details[4]),
        createdAt: details[5],
        fundedAt: details[6],
        submittedAt: details[7],
        evidenceHash: details[8],
    };
}

/**
 * Get dispute details
 */
export async function getDisputeDetails(
    provider: BrowserProvider,
    disputeId: number
): Promise<DisputeDetails> {
    const disputeModule = await getDisputeModule(provider);
    const dispute = await disputeModule.getDispute(disputeId);

    return {
        escrowContract: dispute.escrowContract,
        state: Number(dispute.state),
        clientBond: dispute.clientBond,
        freelancerBond: dispute.freelancerBond,
        clientBondPosted: dispute.clientBondPosted,
        freelancerBondPosted: dispute.freelancerBondPosted,
        votingStartTime: dispute.votingStartTime,
        votingEndTime: dispute.votingEndTime,
        totalStakedForFreelancer: dispute.totalStakedForFreelancer,
        totalStakedForClient: dispute.totalStakedForClient,
        outcome: Number(dispute.outcome),
        resolvedAt: dispute.resolvedAt,
    };
}

/**
 * Format ETH value for display
 */
export function formatEth(value: bigint): string {
    return ethers.formatEther(value);
}

/**
 * Parse ETH string to wei
 */
export function parseEth(value: string): bigint {
    return ethers.parseEther(value);
}

/**
 * Get state label for display
 */
export function getEscrowStateLabel(state: EscrowState): string {
    const labels = {
        [EscrowState.CREATED]: "Created",
        [EscrowState.FUNDED]: "Funded",
        [EscrowState.SUBMITTED]: "Submitted",
        [EscrowState.APPROVED]: "Approved",
        [EscrowState.DISPUTE_OPEN]: "Dispute Open",
        [EscrowState.DISPUTE_ACTIVE]: "Dispute Active",
        [EscrowState.RESOLVED]: "Resolved",
    };
    return labels[state] || "Unknown";
}
