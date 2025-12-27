import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { EscrowContract, DisputeModule } from "../typechain-types";

describe("Escrow System", function () {
    // Fixture to deploy contracts
    async function deployEscrowFixture() {
        const [protocol, client, freelancer, voter1, voter2, voter3] = await ethers.getSigners();

        const milestoneValue = ethers.parseEther("1.0"); // 1 ETH
        const bondValue = (milestoneValue * 30n) / 100n; // 0.3 ETH

        // Deploy DisputeModule
        const DisputeModule = await ethers.getContractFactory("DisputeModule");
        const disputeModule = await DisputeModule.connect(protocol).deploy(protocol.address);
        await disputeModule.waitForDeployment();

        // Deploy EscrowContract (client deploys it)
        const EscrowContract = await ethers.getContractFactory("EscrowContract");
        const escrowContract = await EscrowContract.connect(client).deploy(
            freelancer.address,
            milestoneValue,
            protocol.address
        );
        await escrowContract.waitForDeployment();

        // Set dispute module on escrow
        await escrowContract.connect(protocol).setDisputeModule(await disputeModule.getAddress());

        return {
            escrowContract,
            disputeModule,
            protocol,
            client,
            freelancer,
            voter1,
            voter2,
            voter3,
            milestoneValue,
            bondValue
        };
    }

    describe("EscrowContract", function () {
        describe("Deployment", function () {
            it("Should set the correct client and freelancer", async function () {
                const { escrowContract, client, freelancer } = await loadFixture(deployEscrowFixture);

                const details = await escrowContract.getEscrowDetails();
                expect(details.client).to.equal(client.address);
                expect(details.freelancer).to.equal(freelancer.address);
            });

            it("Should set correct milestone and bond values", async function () {
                const { escrowContract, milestoneValue, bondValue } = await loadFixture(deployEscrowFixture);

                const details = await escrowContract.getEscrowDetails();
                expect(details.milestoneValue).to.equal(milestoneValue);
                expect(details.bondValue).to.equal(bondValue);
            });

            it("Should start in CREATED state", async function () {
                const { escrowContract } = await loadFixture(deployEscrowFixture);
                expect(await escrowContract.getState()).to.equal(0); // CREATED
            });
        });

        describe("Fund", function () {
            it("Should allow client to fund with exact amount", async function () {
                const { escrowContract, client, milestoneValue } = await loadFixture(deployEscrowFixture);

                await expect(escrowContract.connect(client).fund({ value: milestoneValue }))
                    .to.emit(escrowContract, "EscrowFunded")
                    .withArgs(client.address, milestoneValue, await time.latest() + 1);

                expect(await escrowContract.getState()).to.equal(1); // FUNDED
                expect(await escrowContract.getBalance()).to.equal(milestoneValue);
            });

            it("Should reject funding from non-client", async function () {
                const { escrowContract, freelancer, milestoneValue } = await loadFixture(deployEscrowFixture);

                await expect(escrowContract.connect(freelancer).fund({ value: milestoneValue }))
                    .to.be.revertedWithCustomError(escrowContract, "OnlyClient");
            });

            it("Should reject incorrect funding amount", async function () {
                const { escrowContract, client } = await loadFixture(deployEscrowFixture);

                await expect(escrowContract.connect(client).fund({ value: ethers.parseEther("0.5") }))
                    .to.be.revertedWithCustomError(escrowContract, "IncorrectFundingAmount");
            });
        });

        describe("Submit", function () {
            it("Should allow freelancer to submit evidence", async function () {
                const { escrowContract, client, freelancer, milestoneValue } = await loadFixture(deployEscrowFixture);

                await escrowContract.connect(client).fund({ value: milestoneValue });

                const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://QmXyz..."));

                await expect(escrowContract.connect(freelancer).submit(evidenceHash))
                    .to.emit(escrowContract, "WorkSubmitted");

                expect(await escrowContract.getState()).to.equal(2); // SUBMITTED
            });

            it("Should reject submission from non-freelancer", async function () {
                const { escrowContract, client, milestoneValue } = await loadFixture(deployEscrowFixture);

                await escrowContract.connect(client).fund({ value: milestoneValue });

                const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://QmXyz..."));

                await expect(escrowContract.connect(client).submit(evidenceHash))
                    .to.be.revertedWithCustomError(escrowContract, "OnlyFreelancer");
            });
        });

        describe("Approve", function () {
            it("Should transfer funds to freelancer on approval", async function () {
                const { escrowContract, client, freelancer, milestoneValue } = await loadFixture(deployEscrowFixture);

                await escrowContract.connect(client).fund({ value: milestoneValue });

                const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://QmXyz..."));
                await escrowContract.connect(freelancer).submit(evidenceHash);

                const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);

                await expect(escrowContract.connect(client).approve())
                    .to.emit(escrowContract, "WorkApproved");

                const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);
                expect(freelancerBalanceAfter - freelancerBalanceBefore).to.equal(milestoneValue);
                expect(await escrowContract.getState()).to.equal(6); // RESOLVED
            });
        });
    });

    describe("DisputeModule", function () {
        async function fundedAndSubmittedFixture() {
            const fixture = await loadFixture(deployEscrowFixture);
            const { escrowContract, client, freelancer, milestoneValue } = fixture;

            await escrowContract.connect(client).fund({ value: milestoneValue });

            const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://QmXyz..."));
            await escrowContract.connect(freelancer).submit(evidenceHash);

            return fixture;
        }

        describe("Open Dispute", function () {
            it("Should allow client to open dispute after submission", async function () {
                const { escrowContract, disputeModule, client, bondValue } = await loadFixture(fundedAndSubmittedFixture);

                await expect(disputeModule.connect(client).openDispute(await escrowContract.getAddress()))
                    .to.emit(disputeModule, "DisputeOpened")
                    .withArgs(1, await escrowContract.getAddress(), client.address, bondValue);

                expect(await escrowContract.getState()).to.equal(4); // DISPUTE_OPEN
            });
        });

        describe("Bond Posting", function () {
            it("Should activate dispute when both bonds posted", async function () {
                const { escrowContract, disputeModule, client, freelancer, bondValue } = await loadFixture(fundedAndSubmittedFixture);

                await disputeModule.connect(client).openDispute(await escrowContract.getAddress());

                await disputeModule.connect(client).postBond(1, { value: bondValue });
                await disputeModule.connect(freelancer).postBond(1, { value: bondValue });

                expect(await escrowContract.getState()).to.equal(5); // DISPUTE_ACTIVE
                expect(await disputeModule.isVotingActive(1)).to.be.true;
            });
        });

        describe("Voting", function () {
            async function activeDisputeFixture() {
                const fixture = await loadFixture(fundedAndSubmittedFixture);
                const { escrowContract, disputeModule, client, freelancer, bondValue } = fixture;

                await disputeModule.connect(client).openDispute(await escrowContract.getAddress());
                await disputeModule.connect(client).postBond(1, { value: bondValue });
                await disputeModule.connect(freelancer).postBond(1, { value: bondValue });

                return fixture;
            }

            it("Should allow public to vote with stake", async function () {
                const { disputeModule, voter1 } = await loadFixture(activeDisputeFixture);

                const stakeAmount = ethers.parseEther("0.1");

                await expect(disputeModule.connect(voter1).vote(1, 1, { value: stakeAmount })) // 1 = FREELANCER
                    .to.emit(disputeModule, "VoteCast")
                    .withArgs(1, voter1.address, 1, stakeAmount);
            });

            it("Should reject vote below minimum stake", async function () {
                const { disputeModule, voter1 } = await loadFixture(activeDisputeFixture);

                await expect(disputeModule.connect(voter1).vote(1, 1, { value: ethers.parseEther("0.001") }))
                    .to.be.revertedWithCustomError(disputeModule, "StakeTooLow");
            });
        });

        describe("Resolution", function () {
            it("Should resolve in favor of higher stake", async function () {
                const { escrowContract, disputeModule, client, freelancer, voter1, voter2, bondValue, milestoneValue } = await loadFixture(fundedAndSubmittedFixture);

                await disputeModule.connect(client).openDispute(await escrowContract.getAddress());
                await disputeModule.connect(client).postBond(1, { value: bondValue });
                await disputeModule.connect(freelancer).postBond(1, { value: bondValue });

                // Voter1 votes for freelancer with more stake
                await disputeModule.connect(voter1).vote(1, 1, { value: ethers.parseEther("0.5") });
                // Voter2 votes for client with less stake
                await disputeModule.connect(voter2).vote(1, 2, { value: ethers.parseEther("0.3") });

                // Fast forward 3 days
                await time.increase(3 * 24 * 60 * 60 + 1);

                const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);

                await disputeModule.resolveDispute(1);

                const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);

                // Freelancer should receive milestone + their bond back
                expect(freelancerBalanceAfter - freelancerBalanceBefore).to.equal(milestoneValue + bondValue);
                expect(await escrowContract.getState()).to.equal(6); // RESOLVED
            });
        });
    });
});
