import { ethers, upgrades } from "hardhat";
import * as path from 'path';
const fs = require('fs');

async function main() {
  console.log("🔥 Deploying FlamebornEngine to Celo Alfajores...");
  
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
  const FlamebornEngine = await ethers.getContractFactory("FlamebornEngine");
  
  console.log("📋 Contract deployment parameters:");
  console.log("- Admin:", deployer.address);
  console.log("- FLB Token Address: 0xd1b6883205eF7021723334D4ec0dc68D0D156b2a");
  console.log("- HealthIDNFT Address: 0x115aA20101bd0F95516Cc67ea104eD0B0c642919");
  console.log("- Actor Reward: 100 FLB");
  console.log("- Donation Reward Rate: 100 FLB per ETH");
  
  try {
    // Deploy the contract
    console.log("🚀 Deploying contract...");
    const engine = await FlamebornEngine.deploy(
      deployer.address, // admin
      "0xd1b6883205eF7021723334D4ec0dc68D0D156b2a", // FLB token
      "0x115aA20101bd0F95516Cc67ea104eD0B0c642919", // HealthIDNFT
      ethers.parseUnits("100", 18), // actorReward (100 FLB)
      100 // donationRewardRate (100 FLB per ETH)
    );
    
    console.log("Contract deployment transaction sent. Waiting for deployment...");
    await engine.waitForDeployment();
    console.log("Contract deployed. Getting address...");
    const engineAddress = await engine.getAddress();

    console.log("✅ FlamebornEngine deployed successfully!");
    console.log("📍 Contract Address:", engineAddress);
    
    // Verify deployment
    console.log("\n🔍 Verifying deployment..."); // Assuming deployer is the admin
    const admin = await engine.hasRole(await engine.DEFAULT_ADMIN_ROLE(), deployer.address); 
    const tokenAddress = await engine.getAddress();
    const credentialNFTAddress = await engine.getCredentialNFTAddress();
    const actorReward = await engine.getActorReward();
    const donationRewardRate = await engine.getDonationRewardRate();

    console.log("✅ Deployment verification:");
    console.log("- Admin role:", admin);
    console.log("- Token address:", tokenAddress);
    console.log("- Credential NFT address:", credentialNFTAddress);
    console.log("- Actor reward:", ethers.formatUnits(actorReward, 18), "FLB");
    console.log("- Donation reward rate:", donationRewardRate, "FLB per ETH");

    // Save deployment info
    const deploymentInfo = {
      network: "alfajores",
      chainId: 44787,
      contractName: "FlamebornEngine",
      address: engineAddress,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      transactionHash: engine.deploymentTransaction()?.hash || "N/A",
      parameters: {
        admin: deployer.address,
        token: "0xd1b6883205eF7021723334D4ec0dc68D0D156b2a",
        credentialNFT: "0x115aA20101bd0F95516Cc67ea104eD0B0c642919",
        actorReward: "100 FLB",
        donationRewardRate: "100 FLB per ETH"
      }
    };

    // Write deployment info to file
    fs.writeFileSync(
      `deployment-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
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
    throw error;
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
