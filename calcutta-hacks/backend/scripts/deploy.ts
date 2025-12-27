import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    console.log("Network:", network.name);
    console.log("");

    // Deploy DisputeModule first
    console.log("📦 Deploying DisputeModule...");
    const DisputeModule = await ethers.getContractFactory("DisputeModule");
    const disputeModule = await DisputeModule.deploy(deployer.address);
    await disputeModule.waitForDeployment();
    const disputeModuleAddress = await disputeModule.getAddress();
    console.log("✅ DisputeModule deployed to:", disputeModuleAddress);

    // Save deployment info for frontend
    const deploymentInfo = {
        network: network.name,
        chainId: network.config.chainId,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        contracts: {
            DisputeModule: {
                address: disputeModuleAddress,
                abi: JSON.parse(DisputeModule.interface.formatJson()),
            },
            EscrowContract: {
                // This is a factory - each escrow is deployed separately
                abi: JSON.parse((await ethers.getContractFactory("EscrowContract")).interface.formatJson()),
                // Protocol address for creating new escrows
                protocolAddress: deployer.address,
                disputeModuleAddress: disputeModuleAddress,
            },
        },
    };

    // Create frontend contracts directory if it doesn't exist
    const frontendContractsPath = path.join(__dirname, "../../calcutta-hacks/lib/contracts");

    if (!fs.existsSync(frontendContractsPath)) {
        fs.mkdirSync(frontendContractsPath, { recursive: true });
    }

    // Write deployment info
    const deploymentPath = path.join(frontendContractsPath, `deployment-${network.name}.json`);
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📄 Deployment info saved to: ${deploymentPath}`);

    // Also save ABIs separately for easier imports
    const abisPath = path.join(frontendContractsPath, "abis");
    if (!fs.existsSync(abisPath)) {
        fs.mkdirSync(abisPath, { recursive: true });
    }

    fs.writeFileSync(
        path.join(abisPath, "DisputeModule.json"),
        JSON.stringify(deploymentInfo.contracts.DisputeModule.abi, null, 2)
    );
    fs.writeFileSync(
        path.join(abisPath, "EscrowContract.json"),
        JSON.stringify(deploymentInfo.contracts.EscrowContract.abi, null, 2)
    );
    console.log("📄 ABIs saved to:", abisPath);

    console.log("\n🎉 Deployment complete!");
    console.log("\n--- Summary ---");
    console.log("DisputeModule:", disputeModuleAddress);
    console.log("Protocol (fee receiver):", deployer.address);

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
