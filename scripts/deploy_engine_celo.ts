// SPDX-License-Identifier: MIT
import { ethers, upgrades } from "hardhat";
import * as fs from "fs";
import { join } from "path";

async function main() {
  console.log("🚀 Starting FlameBornEngine deployment script");
  console.log("🔥 Deploying FlameBornEngine to Celo Alfajores...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO");

  if (balance === BigInt(0)) {
    throw new Error("❌ Deployer account has no CELO. Fund it on Alfajores.");
  }

  const FlameBornEngine = await ethers.getContractFactory("FlameBornEngine");

  const admin = deployer.address;
  const flbToken = "0xd1b6883205eF7021723334D4ec0dc68D0D156b2a";
  const healthIDNFT = "0x115aA20101bd0F95516Cc67ea104eD0B0c642919";
  const actorReward = ethers.parseUnits("100", 18);
  const donationRewardRate = ethers.parseUnits("100", 18); // 🔧 Fixed unit here

  console.log("📋 Contract deployment parameters:");
  console.log("- Admin:", admin);
  console.log("- FLB Token Address:", flbToken);
  console.log("- HealthIDNFT Address:", healthIDNFT);
  console.log("- Actor Reward:", actorReward.toString());
  console.log("- Donation Reward Rate:", donationRewardRate.toString());

  try {
    const engine = await upgrades.deployProxy(
      FlameBornEngine,
      [admin, flbToken, healthIDNFT, actorReward, donationRewardRate],
      { initializer: "initialize", kind: "uups" }
    );

    console.log("Contract deployment transaction sent. Waiting for deployment...");
    await engine.waitForDeployment();

    const engineAddress = await engine.getAddress();
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(engineAddress);
    const txHash = engine.deploymentTransaction()?.hash;

    console.log("✅ FlameBornEngine deployed to:", engineAddress);
    console.log("🧠 Implementation address:", implementationAddress);
    console.log("🔗 Transaction hash:", txHash);

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
    console.log(`📄 Deployment info written to deployments/${filename}`);

    console.log(`\n🔍 To verify:\nnpx hardhat verify --network alfajores ${implementationAddress}`);
    console.log(`🌍 View on Celoscan:\nhttps://alfajores.celoscan.io/address/${engineAddress}`);
    console.log("✅ Deployment completed successfully!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}

export default main;
