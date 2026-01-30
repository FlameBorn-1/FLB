// SPDX-License-Identifier: MIT

import { ethers, upgrades, run } from "hardhat";
import * as fs from 'fs';
import { join } from 'path';
import { Signer } from "ethers";

// --- Configuration ---
// Best practice: Move this to separate JSON files per network (e.g., deployments/alfajores.config.json)
const config = {
  // Celo Sepolia Testnet (Current - Chain ID: 11142220)
  sepolia: {
    flbTokenAddress: "0x93F4c3B97aa4706e0a84f7667eB7f356F138dC60",
    healthIdNftAddress: "0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6",
    actorReward: ethers.parseUnits("100", 18), // 100 FLB
    donationRewardRate: 100n, // 100 FLB per base unit of native currency
  },
  // Celo Alfajores Testnet (DEPRECATED - Sunset Sept 30, 2025)
  alfajores: {
    flbTokenAddress: "0xd1b6883205eF7021723334D4ec0dc68D0D156b2a",
    healthIdNftAddress: "0x115aA20101bd0F95516Cc67ea104eD0B0c642919",
    actorReward: ethers.parseUnits("100", 18), // 100 FLB
    donationRewardRate: 100n, // 100 FLB per base unit of native currency (e.g., WEI for CELO)
  },
  // Add other networks like 'mainnet' or 'localhost' here
  localhost: {
    // NOTE: These addresses are placeholders. You would deploy new mocks or use existing ones.
    flbTokenAddress: "0x0000000000000000000000000000000000000000",
    healthIdNftAddress: "0x0000000000000000000000000000000000000000",
    actorReward: ethers.parseUnits("100", 18),
    donationRewardRate: 100n,
  }
};

// --- Helper Functions ---

/**
 * Saves deployment information to a file, updating existing data.
 */
function saveDeploymentInfo(network: string, deploymentInfo: object): void {
  const deploymentsDir = join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = join(deploymentsDir, `${network}.json`);
  const existingData = fs.existsSync(filename)
    ? JSON.parse(fs.readFileSync(filename, 'utf-8'))
    : {};

  const updatedData = { ...existingData, ...deploymentInfo };

  fs.writeFileSync(filename, JSON.stringify(updatedData, null, 2));
  console.log(`✅ Deployment info saved to ${filename}`);
}

/**
 * Verifies a contract on the block explorer.
 */
async function verifyContract(address: string): Promise<void> {
  console.log(`\n🔍 Verifying contract at ${address}...`);
  try {
    // Wait for a few blocks to ensure the contract is propagated on the network
    console.log("Waiting 30 seconds for block explorer to index the contract...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    await run("verify:verify", {
      address: address,
      constructorArguments: [], // No constructor args for the implementation
    });
    console.log("✅ Contract verified successfully!");
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("✅ Contract is already verified.");
    } else {
      console.error("❌ Verification failed:", error.message);
    }
  }
}

async function checkPrerequisites(deployer: Signer) {
  console.log("Deploying with account:", await deployer.getAddress());
  const balance = await ethers.provider.getBalance(deployer);
  console.log("Account balance:", ethers.formatEther(balance), "CELO");

  if (balance === 0n) {
    throw new Error("❌ Deployer account has no CELO. Please fund your account.");
  }
}

async function main() {
  console.log("🚀 Starting FlameBornEngine deployment script");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === 'unknown' || network.name === 'homestead' ? 'localhost' : network.name;

  console.log(`🔥 Deploying FlameBornEngine to ${networkName} (Chain ID: ${network.chainId})...`);

  await checkPrerequisites(deployer);

  const networkConfig = (config as any)[networkName];
  if (!networkConfig) {
    throw new Error(`❌ No configuration found for network '${networkName}'.`);
  }

  const FlameBornEngine = await ethers.getContractFactory("FlameBornEngine");

  const args = [
    await deployer.getAddress(), // admin
    networkConfig.flbTokenAddress,
    networkConfig.healthIdNftAddress,
    networkConfig.actorReward,
    networkConfig.donationRewardRate,
  ];

  console.log("📋 Contract deployment parameters:");
  console.log(`- Admin: ${args[0]}`);
  console.log(`- FLB Token Address: ${args[1]}`);
  console.log(`- HealthIDNFT Address: ${args[2]}`);
  console.log(`- Actor Reward: ${ethers.formatEther(args[3])} FLB`);
  console.log(`- Donation Reward Rate: ${args[4].toString()} FLB per base unit`);

  console.log("\n🚀 Deploying proxy...");
  const engine = await upgrades.deployProxy(FlameBornEngine, args, {
    initializer: "initialize",
    kind: "uups",
    timeout: 0, // No timeout for deployment
  });

  await engine.waitForDeployment();
  const engineAddress = await engine.getAddress();
  console.log("✅ FlameBornEngine (Proxy) deployed to:", engineAddress);

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(engineAddress);
  console.log("🧠 Implementation address:", implementationAddress);

  const deploymentInfo = {
    FlameBornEngine: {
      address: engineAddress,
      implementation: implementationAddress,
      deployer: await deployer.getAddress(),
      timestamp: new Date().toISOString(),
      transactionHash: engine.deploymentTransaction()?.hash,
    }
  };

  saveDeploymentInfo(networkName, deploymentInfo);

  console.log("\n🌍 View on Celoscan:");
  console.log(`https://alfajores.celoscan.io/address/${engineAddress}`);

  if (networkName !== 'localhost' && networkName !== 'hardhat') {
    await verifyContract(engineAddress);
  }

  console.log("\n🎉 Deployment completed successfully!");
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exitCode = 1;
  });
}

export default main;
