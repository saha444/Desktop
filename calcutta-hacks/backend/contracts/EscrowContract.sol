// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title EscrowContract
 * @notice Manages milestone-based escrow payments with dispute resolution support
 * @dev Locks ETH, tracks escrow state, delegates disputes to DisputeModule
 */
contract EscrowContract {
    // ============ Enums ============

    enum EscrowState {
        CREATED,        // Initial state after construction
        FUNDED,         // Client has deposited milestone ETH
        SUBMITTED,      // Freelancer has submitted work evidence
        APPROVED,       // Client approved, funds released
        DISPUTE_OPEN,   // Client raised a dispute
        DISPUTE_ACTIVE, // Dispute is being resolved
        RESOLVED        // Final state - funds distributed
    }

    // ============ Structs ============

    struct Escrow {
        address client;
        address freelancer;
        uint256 milestoneValue;  // V - the milestone payment amount
        uint256 bondValue;       // 30% of V - required bond for disputes
        EscrowState state;
        uint256 createdAt;
        uint256 fundedAt;
        uint256 submittedAt;
        bytes32 evidenceHash;    // IPFS hash or other evidence reference
    }

    // ============ Storage ============

    Escrow public escrow;
    address public disputeModule;
    address public protocol;  // Receives fees & losing party's bond

    // ============ Events ============

    event EscrowCreated(
        address indexed client,
        address indexed freelancer,
        uint256 milestoneValue,
        uint256 bondValue
    );
    
    event EscrowFunded(
        address indexed client,
        uint256 amount,
        uint256 timestamp
    );
    
    event WorkSubmitted(
        address indexed freelancer,
        bytes32 evidenceHash,
        uint256 timestamp
    );
    
    event WorkApproved(
        address indexed client,
        address indexed freelancer,
        uint256 amount,
        uint256 timestamp
    );

    event DisputeModuleSet(address indexed disputeModule);

    // ============ Errors ============

    error OnlyClient();
    error OnlyFreelancer();
    error OnlyDisputeModule();
    error InvalidState(EscrowState current, EscrowState required);
    error IncorrectFundingAmount(uint256 sent, uint256 required);
    error TransferFailed();

    // ============ Modifiers ============

    modifier onlyClient() {
        if (msg.sender != escrow.client) revert OnlyClient();
        _;
    }

    modifier onlyFreelancer() {
        if (msg.sender != escrow.freelancer) revert OnlyFreelancer();
        _;
    }

    modifier onlyDisputeModule() {
        if (msg.sender != disputeModule) revert OnlyDisputeModule();
        _;
    }

    modifier inState(EscrowState _state) {
        if (escrow.state != _state) revert InvalidState(escrow.state, _state);
        _;
    }

    // ============ Constructor ============

    /**
     * @notice Creates a new escrow contract
     * @param _freelancer Address of the freelancer who will receive payment
     * @param _milestoneValue The milestone payment amount in wei
     * @param _protocol Address that receives fees and losing bonds
     */
    constructor(
        address _freelancer,
        uint256 _milestoneValue,
        address _protocol
    ) {
        require(_freelancer != address(0), "Invalid freelancer address");
        require(_milestoneValue > 0, "Milestone value must be > 0");
        require(_protocol != address(0), "Invalid protocol address");

        escrow = Escrow({
            client: msg.sender,
            freelancer: _freelancer,
            milestoneValue: _milestoneValue,
            bondValue: (_milestoneValue * 30) / 100,  // 30% bond
            state: EscrowState.CREATED,
            createdAt: block.timestamp,
            fundedAt: 0,
            submittedAt: 0,
            evidenceHash: bytes32(0)
        });

        protocol = _protocol;

        emit EscrowCreated(
            msg.sender,
            _freelancer,
            _milestoneValue,
            escrow.bondValue
        );
    }

    // ============ Escrow Lifecycle Functions ============

    /**
     * @notice Fund the escrow with the milestone amount
     * @dev Only client can call, must send exact milestone value
     */
    function fund() external payable onlyClient inState(EscrowState.CREATED) {
        if (msg.value != escrow.milestoneValue) {
            revert IncorrectFundingAmount(msg.value, escrow.milestoneValue);
        }

        escrow.state = EscrowState.FUNDED;
        escrow.fundedAt = block.timestamp;

        emit EscrowFunded(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Submit work evidence for client review
     * @param _evidenceHash IPFS hash or reference to submitted work
     * @dev Only freelancer can call, escrow must be funded
     */
    function submit(bytes32 _evidenceHash) 
        external 
        onlyFreelancer 
        inState(EscrowState.FUNDED) 
    {
        require(_evidenceHash != bytes32(0), "Evidence hash cannot be empty");

        escrow.evidenceHash = _evidenceHash;
        escrow.state = EscrowState.SUBMITTED;
        escrow.submittedAt = block.timestamp;

        emit WorkSubmitted(msg.sender, _evidenceHash, block.timestamp);
    }

    /**
     * @notice Approve submitted work and release payment to freelancer
     * @dev Only client can call, work must be submitted
     */
    function approve() external onlyClient inState(EscrowState.SUBMITTED) {
        escrow.state = EscrowState.RESOLVED;

        // Transfer milestone to freelancer
        (bool success, ) = escrow.freelancer.call{value: escrow.milestoneValue}("");
        if (!success) revert TransferFailed();

        emit WorkApproved(
            msg.sender,
            escrow.freelancer,
            escrow.milestoneValue,
            block.timestamp
        );
    }

    // ============ Dispute Module Integration ============

    /**
     * @notice Set the dispute module address
     * @param _disputeModule Address of the dispute resolution module
     * @dev Only protocol can set this
     */
    function setDisputeModule(address _disputeModule) external {
        require(msg.sender == protocol, "Only protocol can set dispute module");
        require(_disputeModule != address(0), "Invalid dispute module address");
        
        disputeModule = _disputeModule;
        
        emit DisputeModuleSet(_disputeModule);
    }

    /**
     * @notice Open a dispute (called by client through dispute module)
     * @dev Only dispute module can call this
     */
    function openDispute() external onlyDisputeModule inState(EscrowState.SUBMITTED) {
        escrow.state = EscrowState.DISPUTE_OPEN;
    }

    /**
     * @notice Activate the dispute (voting begins)
     * @dev Only dispute module can call this
     */
    function activateDispute() external onlyDisputeModule inState(EscrowState.DISPUTE_OPEN) {
        escrow.state = EscrowState.DISPUTE_ACTIVE;
    }

    /**
     * @notice Resolve the dispute and distribute funds
     * @param _freelancerWins True if freelancer wins, false if client wins
     * @dev Only dispute module can call this
     */
    function resolveDispute(bool _freelancerWins) 
        external 
        onlyDisputeModule 
        inState(EscrowState.DISPUTE_ACTIVE) 
    {
        escrow.state = EscrowState.RESOLVED;

        if (_freelancerWins) {
            // Freelancer wins: gets the milestone
            (bool success, ) = escrow.freelancer.call{value: escrow.milestoneValue}("");
            if (!success) revert TransferFailed();
        } else {
            // Client wins: gets refund
            (bool success, ) = escrow.client.call{value: escrow.milestoneValue}("");
            if (!success) revert TransferFailed();
        }
    }

    // ============ View Functions ============

    /**
     * @notice Get the current escrow state
     */
    function getState() external view returns (EscrowState) {
        return escrow.state;
    }

    /**
     * @notice Get full escrow details
     */
    function getEscrowDetails() 
        external 
        view 
        returns (
            address client,
            address freelancer,
            uint256 milestoneValue,
            uint256 bondValue,
            EscrowState state,
            uint256 createdAt,
            uint256 fundedAt,
            uint256 submittedAt,
            bytes32 evidenceHash
        ) 
    {
        return (
            escrow.client,
            escrow.freelancer,
            escrow.milestoneValue,
            escrow.bondValue,
            escrow.state,
            escrow.createdAt,
            escrow.fundedAt,
            escrow.submittedAt,
            escrow.evidenceHash
        );
    }

    /**
     * @notice Get the contract's ETH balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
