import { ethers, BrowserProvider, Contract } from "ethers";
import deploymentData from "./deployment-sepolia.json";

// Extract ABIs from deployment data
const EscrowContractABI = deploymentData.contracts.EscrowContract.abi;
const DisputeModuleABI = deploymentData.contracts.DisputeModule.abi;

// EscrowContract bytecode from compiled artifacts
const EscrowContractBytecode = "0x608060405234801561001057600080fd5b50604051610e03380380610e0383398101604081905261002f916102b0565b6001600160a01b03831661008a5760405162461bcd60e51b815260206004820152601a60248201527f496e76616c696420667265656c616e636572206164647265737300000000000060448201526064015b60405180910390fd5b600082116100da5760405162461bcd60e51b815260206004820152601b60248201527f4d696c6573746f6e652076616c7565206d757374206265203e203000000000006044820152606401610081565b6001600160a01b0381166101305760405162461bcd60e51b815260206004820152601860248201527f496e76616c69642070726f746f636f6c206164647265737300000000000000006044820152606401610081565b60408051610120810182523381526001600160a01b038516602082015290810183905260608101606461016485601e6102ec565b61016e9190610317565b815260200160008152426020808301919091526000604080840182905260608085018390526080948501839052855183546001600160a01b03199081166001600160a01b03928316178555948701516001805490961691161784559085015160025584015160035591830151600480549192909160ff1916908360068111156101f9576101f9610339565b021790555060a0820151600582015560c0820151600682015560e0820151600782015561010090910151600890910155600a80546001600160a01b0319166001600160a01b03838116919091179091556003546040805185815260208101929092529185169133917f5f1c67a4567ebc365d6a9ce0622c51e2fff9198c740d4fb8b5af2d4b4b2852af910160405180910390a350505061034f565b80516001600160a01b03811681146102ab57600080fd5b919050565b6000806000606084860312156102c557600080fd5b6102ce84610294565b9250602084015191506102e360408501610294565b90509250925092565b808202811582820484141761031157634e487b7160e01b600052601160045260246000fd5b92915050565b60008261033457634e487b7160e01b600052601260045260246000fd5b500490565b634e487b7160e01b600052602160045260246000fd5b610aa58061035e6000396000f3fe6080604052600436106100c25760003560e01c806389e1e82a1161007f578063b60d428811610059578063b60d4288146101e0578063d9caa3d2146101e8578063e2fdcc1714610208578063f56606601461026357600080fd5b806389e1e82a146101805780638ce74426146101a0578063a36a3f05146101c057600080fd5b806312065fe0146100c757806312424e3f146100e75780631865c57d146100fe5780634fd6137c1461011e578063777181931461013357806383562af014610148575b600080fd5b3480156100d357600080fd5b506040514781526020015b60405180910390f35b3480156100f357600080fd5b506100fc6102a6565b005b34801561010a57600080fd5b5060045460ff166040516100de919061097a565b34801561012a57600080fd5b506100fc6103ef565b34801561013f57600080fd5b506100fc610472565b34801561015457600080fd5b50600954610168906001600160a01b031681565b6040516001600160a01b0390911681526020016100de565b34801561018c57600080fd5b506100fc61019b36600461098e565b6104f3565b3480156101ac57600080fd5b50600a54610168906001600160a01b031681565b3480156101cc57600080fd5b506100fc6101db3660046109b7565b61063c565b6100fc610742565b3480156101f457600080fd5b506100fc6102033660046109e0565b610830565b34801561021457600080fd5b5060005460015460025460035460045460055460065460075460085461024e986001600160a01b03908116981696959460ff169392919089565b6040516100de999897969594939291906109f9565b34801561026f57600080fd5b506000546001546002546003546004546005546006546007546008546001600160a01b03988916989097169660ff9094169361024e565b6000546001600160a01b031633146102d15760405163d6d90f8960e01b815260040160405180910390fd5b60028060045460ff1660068111156102eb576102eb610942565b1461031c5760048054604051633bf2e2f960e11b81526103139260ff90921691849101610a54565b60405180910390fd5b6004805460ff191660061790556001546002546040516000926001600160a01b031691908381818185875af1925050503d8060008114610378576040519150601f19603f3d011682016040523d82523d6000602084013e61037d565b606091505b505090508061039f576040516312171d8360e31b815260040160405180910390fd5b600154600254604080519182524260208301526001600160a01b039092169133917f40106bbe14dffd282b622759b6fe7581659ab685cdc2dff60912781a36db9595910160405180910390a35050565b6009546001600160a01b0316331461041a5760405163655cd9d560e01b815260040160405180910390fd5b60028060045460ff16600681111561043457610434610942565b1461045c5760048054604051633bf2e2f960e11b81526103139260ff90921691849101610a54565b60048054819060ff19166001825b021790555050565b6009546001600160a01b0316331461049d5760405163655cd9d560e01b815260040160405180910390fd5b60048060045460ff1660068111156104b7576104b7610942565b146104df5760048054604051633bf2e2f960e11b81526103139260ff90921691849101610a54565b600480546005919060ff191660018361046a565b6009546001600160a01b0316331461051e5760405163655cd9d560e01b815260040160405180910390fd5b60058060045460ff16600681111561053857610538610942565b146105605760048054604051633bf2e2f960e11b81526103139260ff90921691849101610a54565b6004805460ff1916600617905581156105ee576001546002546040516000926001600160a01b031691908381818185875af1925050503d80600081146105c2576040519150601f19603f3d011682016040523d82523d6000602084013e6105c7565b606091505b50509050806105e9576040516312171d8360e31b815260040160405180910390fd5b505050565b600080546002546040516001600160a01b03909216918381818185875af1925050503d80600081146105c2576040519150601f19603f3d011682016040523d82523d6000602084013e6105c7565b600a546001600160a01b031633146106a25760405162461bcd60e51b8152602060048201526024808201527f4f6e6c792070726f746f636f6c2063616e207365742064697370757465206d6f60448201526364756c6560e01b6064820152608401610313565b6001600160a01b0381166106f85760405162461bcd60e51b815260206004820152601e60248201527f496e76616c69642064697370757465206d6f64756c65206164647265737300006044820152606401610313565b600980546001600160a01b0319166001600160a01b0383169081179091556040517f3cb272a70ae4fdd5ccd37398b589a714860a7328fefe266bf5ae923d39105a2d90600090a250565b6000546001600160a01b0316331461076d5760405163d6d90f8960e01b815260040160405180910390fd5b60008060045460ff16600681111561078757610787610942565b146107af5760048054604051633bf2e2f960e11b81526103139260ff90921691849101610a54565b60025434146107de57600254604051633673c7ef60e01b81523460048201526024810191909152604401610313565b6004805460ff1916600117905542600681905560408051348152602081019290925233917f5f473cfeec409cab2916f3e399601275ea6470cf22f2d230fe1595d6790e5d49910160405180910390a250565b6001546001600160a01b0316331461085b57604051636b7809b960e01b815260040160405180910390fd5b60018060045460ff16600681111561087557610875610942565b1461089d5760048054604051633bf2e2f960e11b81526103139260ff90921691849101610a54565b816108ea5760405162461bcd60e51b815260206004820152601d60248201527f45766964656e636520686173682063616e6e6f7420626520656d7074790000006044820152606401610313565b60088290556004805460ff1916600217905542600781905560408051848152602081019290925233917fb2ef485bd095e1e8cb4ebfb386a090151a743cb511d24e766b2851ae3479a121910160405180910390a25050565b634e487b7160e01b600052602160045260246000fd5b6007811061097657634e487b7160e01b600052602160045260246000fd5b9052565b602081016109888284610958565b92915050565b6000602082840312156109a057600080fd5b813580151581146109b057600080fd5b9392505050565b6000602082840312156109c957600080fd5b81356001600160a01b03811681146109b057600080fd5b6000602082840312156109f257600080fd5b5035919050565b6001600160a01b038a811682528916602082015260408101889052606081018790526101208101610a2d6080830188610958565b8560a08301528460c08301528360e0830152826101008301529a9950505050505050505050565b60408101610a628285610958565b6109b0602083018461095856fea264697066735822122021e577221c0f0a3606f402119de1e9c090810246385ac16ac64c4b37a42e255b64736f6c634300081c0033";

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
        EscrowContractBytecode,
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
