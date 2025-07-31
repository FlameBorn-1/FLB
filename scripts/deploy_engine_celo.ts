// SPDX-License-Identifier: MIT

import { ethers, upgrades } from "hardhat";
import * as fs from 'fs';
import { join } from 'path';

async function main() {
  console.log("🚀 Starting FlameBornEngine deployment script");
  console.log("🔥 Deploying FlameBornEngine to Celo Alfajores...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO");
  
  if (balance === BigInt(0)) {
    throw new Error("❌ Deployer account has no CELO. Please fund your account with Alfajores testnet CELO.");
  }

  // Get the contract factory
  const FlameBornEngine = await ethers.getContractFactory("FlameBornEngine");
  
  console.log("📋 Contract deployment parameters:");
  console.log("- Admin:", deployer.address);
  console.log("- FLB Token Address: 0xd1b6883205eF7021723334D4ec0dc68D0D156b2a");
  console.log("- HealthIDNFT Address: 0x115aA20101bd0F95516Cc67ea104eD0B0c642919");
  console.log("- Actor Reward: 100 FLB");
  console.log("- Donation Reward Rate: 100 FLB per ETH");
  
  try {
    // Deploy the contract
    console.log("🚀 Deploying contract...");
    const engine = await upgrades.deployProxy(
      FlameBornEngine,
      [
        deployer.address, // admin
        "0xd1b6883205eF7021723334D4ec0dc68D0D156b2a", // FLB token
        "0x115aA20101bd0F95516Cc67ea104eD0B0c642919", // HealthIDNFT
        ethers.parseUnits("100", 18), // actorReward (100 FLB)
        100 // donationRewardRate (100 FLB per ETH)
      ],
      { initializer: "initialize", kind: "uups" }
    );
    
    console.log("Contract deployment transaction sent. Waiting for deployment...");
    await engine.waitForDeployment();
    console.log("Contract deployed. Getting address...");
    const engineAddress = await engine.getAddress();

    console.log("✅ FlameBornEngine deployed to:", engineAddress);
    
    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(engineAddress);
    console.log("🧠 Implementation address:", implementationAddress);
    
    // Get deployment transaction
    console.log("Transaction hash:", engine.deploymentTransaction()?.hash);

    // Verification preparation
    console.log("Preparing for verification...");
    
    // Write deployment info to file
    const deploymentInfo = {
      network: "alfajores",
      contract: "FlameBornEngine",
      address: engineAddress,
      implementation: implementationAddress,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
    };

    const filename = `deployment-${Date.now()}.json`;
    fs.writeFileSync(join(__dirname, "..", "deployments", filename), JSON.stringify(deploymentInfo, null, 2));
    console.log(`Deployment info written to deployments/${filename}`);

    console.log("\nTo verify the contract, run:");
    console.log(`npx hardhat verify --network alfajores ${engineAddress}`);
    
    console.log("\n🌍 View on Celoscan:");
    console.log(`https://alfajores.celoscan.io/address/${engineAddress}`);
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("💡 Next steps:");
    console.log("1. Verify the contract on Celoscan");
    console.log("2. Test engine functionality");
    
    return {
      address: engineAddress,
      deployer: deployer.address
    };
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}

export default main;
