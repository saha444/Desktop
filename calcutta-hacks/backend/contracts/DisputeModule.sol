// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./EscrowContract.sol";

/**
 * @title DisputeModule
 * @notice Manages decentralized dispute resolution through economic staking
 * @dev Public participants stake ETH to vote on dispute outcomes
 */
contract DisputeModule {
    // ============ Enums ============

    enum DisputeState {
        NONE,           // No dispute
        OPEN,           // Dispute raised, awaiting bonds
        ACTIVE,         // Both bonds posted, voting active
        RESOLVED        // Dispute resolved
    }

    enum Vote {
        NONE,
        FREELANCER,     // Vote for freelancer
        CLIENT          // Vote for client
    }

    // ============ Structs ============

    struct Dispute {
        address escrowContract;
        DisputeState state;
        
        // Bonds
        uint256 clientBond;
        uint256 freelancerBond;
        bool clientBondPosted;
        bool freelancerBondPosted;
        
        // Voting
        uint256 votingStartTime;
        uint256 votingEndTime;
        uint256 totalStakedForFreelancer;
        uint256 totalStakedForClient;
        
        // Resolution
        Vote outcome;
        uint256 resolvedAt;
    }

    struct Stake {
        Vote vote;
        uint256 amount;
        bool claimed;
    }

    // ============ Constants ============

    uint256 public constant VOTING_DURATION = 3 days;
    uint256 public constant MIN_STAKE = 0.01 ether;
    uint256 public constant PROTOCOL_FEE_BPS = 500; // 5%

    // ============ Storage ============

    address public protocol;
    uint256 public disputeCount;
    
    // disputeId => Dispute
    mapping(uint256 => Dispute) public disputes;
    
    // disputeId => voter => Stake
    mapping(uint256 => mapping(address => Stake)) public stakes;
    
    // escrowContract => disputeId (0 if none)
    mapping(address => uint256) public escrowToDispute;

    // ============ Events ============

    event DisputeOpened(
        uint256 indexed disputeId,
        address indexed escrowContract,
        address indexed client,
        uint256 bondRequired
    );

    event BondPosted(
        uint256 indexed disputeId,
        address indexed party,
        uint256 amount,
        bool isClient
    );

    event DisputeActivated(
        uint256 indexed disputeId,
        uint256 votingEndTime
    );

    event VoteCast(
        uint256 indexed disputeId,
        address indexed voter,
        Vote vote,
        uint256 amount
    );

    event DisputeResolved(
        uint256 indexed disputeId,
        Vote outcome,
        uint256 totalWinningStake,
        uint256 totalLosingStake
    );

    event RewardsClaimed(
        uint256 indexed disputeId,
        address indexed voter,
        uint256 reward
    );

    // ============ Errors ============

    error OnlyProtocol();
    error OnlyClient();
    error OnlyFreelancer();
    error InvalidState();
    error BondAlreadyPosted();
    error IncorrectBondAmount();
    error VotingNotActive();
    error VotingEnded();
    error VotingNotEnded();
    error AlreadyVoted();
    error StakeTooLow();
    error AlreadyClaimed();
    error NotWinningVote();
    error TransferFailed();
    error DisputeNotFound();

    // ============ Modifiers ============

    modifier onlyProtocol() {
        if (msg.sender != protocol) revert OnlyProtocol();
        _;
    }

    // ============ Constructor ============

    constructor(address _protocol) {
        require(_protocol != address(0), "Invalid protocol address");
        protocol = _protocol;
    }

    // ============ Dispute Lifecycle ============

    /**
     * @notice Open a dispute for an escrow
     * @param _escrowContract Address of the escrow contract
     */
    function openDispute(address _escrowContract) external {
        EscrowContract escrow = EscrowContract(_escrowContract);
        
        // Verify caller is the client
        (address client, , , uint256 bondValue, , , , , ) = escrow.getEscrowDetails();
        require(msg.sender == client, "Only client can open dispute");
        
        // Verify escrow is in SUBMITTED state
        require(escrow.getState() == EscrowContract.EscrowState.SUBMITTED, "Invalid escrow state");
        
        // Create dispute
        disputeCount++;
        uint256 disputeId = disputeCount;
        
        disputes[disputeId] = Dispute({
            escrowContract: _escrowContract,
            state: DisputeState.OPEN,
            clientBond: bondValue,
            freelancerBond: bondValue,
            clientBondPosted: false,
            freelancerBondPosted: false,
            votingStartTime: 0,
            votingEndTime: 0,
            totalStakedForFreelancer: 0,
            totalStakedForClient: 0,
            outcome: Vote.NONE,
            resolvedAt: 0
        });
        
        escrowToDispute[_escrowContract] = disputeId;
        
        // Update escrow state
        escrow.openDispute();
        
        emit DisputeOpened(disputeId, _escrowContract, client, bondValue);
    }

    /**
     * @notice Post bond to participate in dispute
     * @param _disputeId The dispute ID
     */
    function postBond(uint256 _disputeId) external payable {
        Dispute storage dispute = disputes[_disputeId];
        if (dispute.state != DisputeState.OPEN) revert InvalidState();
        
        EscrowContract escrow = EscrowContract(dispute.escrowContract);
        (address client, address freelancer, , , , , , , ) = escrow.getEscrowDetails();
        
        if (msg.sender == client) {
            if (dispute.clientBondPosted) revert BondAlreadyPosted();
            if (msg.value != dispute.clientBond) revert IncorrectBondAmount();
            
            dispute.clientBondPosted = true;
            emit BondPosted(_disputeId, msg.sender, msg.value, true);
            
        } else if (msg.sender == freelancer) {
            if (dispute.freelancerBondPosted) revert BondAlreadyPosted();
            if (msg.value != dispute.freelancerBond) revert IncorrectBondAmount();
            
            dispute.freelancerBondPosted = true;
            emit BondPosted(_disputeId, msg.sender, msg.value, false);
            
        } else {
            revert("Only client or freelancer can post bond");
        }
        
        // If both bonds posted, activate dispute
        if (dispute.clientBondPosted && dispute.freelancerBondPosted) {
            _activateDispute(_disputeId);
        }
    }

    /**
     * @dev Internal function to activate dispute voting
     */
    function _activateDispute(uint256 _disputeId) internal {
        Dispute storage dispute = disputes[_disputeId];
        
        dispute.state = DisputeState.ACTIVE;
        dispute.votingStartTime = block.timestamp;
        dispute.votingEndTime = block.timestamp + VOTING_DURATION;
        
        // Update escrow state
        EscrowContract(dispute.escrowContract).activateDispute();
        
        emit DisputeActivated(_disputeId, dispute.votingEndTime);
    }

    // ============ Voting ============

    /**
     * @notice Cast a vote by staking ETH
     * @param _disputeId The dispute ID
     * @param _vote Vote for FREELANCER or CLIENT
     */
    function vote(uint256 _disputeId, Vote _vote) external payable {
        Dispute storage dispute = disputes[_disputeId];
        
        if (dispute.state != DisputeState.ACTIVE) revert VotingNotActive();
        if (block.timestamp > dispute.votingEndTime) revert VotingEnded();
        if (_vote == Vote.NONE) revert("Invalid vote");
        if (msg.value < MIN_STAKE) revert StakeTooLow();
        
        Stake storage existingStake = stakes[_disputeId][msg.sender];
        if (existingStake.vote != Vote.NONE) revert AlreadyVoted();
        
        // Record stake
        stakes[_disputeId][msg.sender] = Stake({
            vote: _vote,
            amount: msg.value,
            claimed: false
        });
        
        // Update totals
        if (_vote == Vote.FREELANCER) {
            dispute.totalStakedForFreelancer += msg.value;
        } else {
            dispute.totalStakedForClient += msg.value;
        }
        
        emit VoteCast(_disputeId, msg.sender, _vote, msg.value);
    }

    // ============ Resolution ============

    /**
     * @notice Resolve the dispute after voting ends
     * @param _disputeId The dispute ID
     */
    function resolveDispute(uint256 _disputeId) external {
        Dispute storage dispute = disputes[_disputeId];
        
        if (dispute.state != DisputeState.ACTIVE) revert InvalidState();
        if (block.timestamp <= dispute.votingEndTime) revert VotingNotEnded();
        
        // Determine winner based on stake
        Vote outcome;
        if (dispute.totalStakedForFreelancer > dispute.totalStakedForClient) {
            outcome = Vote.FREELANCER;
        } else if (dispute.totalStakedForClient > dispute.totalStakedForFreelancer) {
            outcome = Vote.CLIENT;
        } else {
            // Tie: default to freelancer (work was done)
            outcome = Vote.FREELANCER;
        }
        
        dispute.outcome = outcome;
        dispute.state = DisputeState.RESOLVED;
        dispute.resolvedAt = block.timestamp;
        
        // Resolve escrow
        EscrowContract escrow = EscrowContract(dispute.escrowContract);
        escrow.resolveDispute(outcome == Vote.FREELANCER);
        
        // Transfer losing bond to protocol
        uint256 losingBond = (outcome == Vote.FREELANCER) 
            ? dispute.clientBond 
            : dispute.freelancerBond;
            
        (bool success, ) = protocol.call{value: losingBond}("");
        if (!success) revert TransferFailed();
        
        // Return winning bond
        (address client, address freelancer, , , , , , , ) = escrow.getEscrowDetails();
        address winner = (outcome == Vote.FREELANCER) ? freelancer : client;
        uint256 winningBond = (outcome == Vote.FREELANCER) 
            ? dispute.freelancerBond 
            : dispute.clientBond;
            
        (success, ) = winner.call{value: winningBond}("");
        if (!success) revert TransferFailed();
        
        emit DisputeResolved(
            _disputeId,
            outcome,
            outcome == Vote.FREELANCER ? dispute.totalStakedForFreelancer : dispute.totalStakedForClient,
            outcome == Vote.FREELANCER ? dispute.totalStakedForClient : dispute.totalStakedForFreelancer
        );
    }

    /**
     * @notice Claim rewards for winning voters
     * @param _disputeId The dispute ID
     */
    function claimRewards(uint256 _disputeId) external {
        Dispute storage dispute = disputes[_disputeId];
        Stake storage userStake = stakes[_disputeId][msg.sender];
        
        if (dispute.state != DisputeState.RESOLVED) revert InvalidState();
        if (userStake.vote != dispute.outcome) revert NotWinningVote();
        if (userStake.claimed) revert AlreadyClaimed();
        
        userStake.claimed = true;
        
        // Calculate reward
        uint256 winningPool = (dispute.outcome == Vote.FREELANCER) 
            ? dispute.totalStakedForFreelancer 
            : dispute.totalStakedForClient;
        uint256 losingPool = (dispute.outcome == Vote.FREELANCER) 
            ? dispute.totalStakedForClient 
            : dispute.totalStakedForFreelancer;
        
        // Protocol fee from losing pool
        uint256 protocolFee = (losingPool * PROTOCOL_FEE_BPS) / 10000;
        uint256 rewardPool = losingPool - protocolFee;
        
        // User's share of rewards + original stake
        uint256 userShare = (userStake.amount * rewardPool) / winningPool;
        uint256 totalPayout = userStake.amount + userShare;
        
        // Transfer protocol fee
        if (protocolFee > 0) {
            (bool feeSuccess, ) = protocol.call{value: protocolFee}("");
            if (!feeSuccess) revert TransferFailed();
        }
        
        // Transfer rewards to user
        (bool success, ) = msg.sender.call{value: totalPayout}("");
        if (!success) revert TransferFailed();
        
        emit RewardsClaimed(_disputeId, msg.sender, totalPayout);
    }

    // ============ View Functions ============

    /**
     * @notice Get dispute details
     */
    function getDispute(uint256 _disputeId) external view returns (Dispute memory) {
        return disputes[_disputeId];
    }

    /**
     * @notice Get user's stake for a dispute
     */
    function getStake(uint256 _disputeId, address _voter) external view returns (Stake memory) {
        return stakes[_disputeId][_voter];
    }

    /**
     * @notice Check if voting is active for a dispute
     */
    function isVotingActive(uint256 _disputeId) external view returns (bool) {
        Dispute storage dispute = disputes[_disputeId];
        return dispute.state == DisputeState.ACTIVE && 
               block.timestamp <= dispute.votingEndTime;
    }

    /**
     * @notice Get time remaining for voting
     */
    function getVotingTimeRemaining(uint256 _disputeId) external view returns (uint256) {
        Dispute storage dispute = disputes[_disputeId];
        if (dispute.state != DisputeState.ACTIVE) return 0;
        if (block.timestamp >= dispute.votingEndTime) return 0;
        return dispute.votingEndTime - block.timestamp;
    }
}
