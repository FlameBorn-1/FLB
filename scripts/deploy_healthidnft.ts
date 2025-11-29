import { ethers } from "hardhat";
import { createDeployHelper } from "../utils/deployHelper";

async function main() {
  console.log("🏥 Deploying FlameBornHealthIDNFT...");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const helper = createDeployHelper(network.name);

  helper.setDeployer(deployer.address);

  // Check if already deployed
  if (helper.isDeployed("FlameBornHealthIDNFT")) {
    const existingAddress = helper.getAddress("FlameBornHealthIDNFT");
    console.log(`✅ FlameBornHealthIDNFT already deployed at: ${existingAddress}`);
    console.log("⏭️  Skipping deployment");
    return existingAddress;
  }

  console.log("🚀 Deploying new FlameBornHealthIDNFT...");

  const HealthNFT = await ethers.getContractFactory("FlameBornHealthIDNFT");
  const healthNFT = await HealthNFT.deploy(deployer.address);
  await healthNFT.waitForDeployment();

  const healthNFTAddress = await healthNFT.getAddress();
  const healthNFTTx = healthNFT.deploymentTransaction();

  console.log(`✅ FlameBornHealthIDNFT deployed at: ${healthNFTAddress}`);

  // Save deployment info
  helper.saveDeployment("FlameBornHealthIDNFT", healthNFTAddress, healthNFTTx?.hash);

  return healthNFTAddress;
}

main().catch((error) => {
  console.error("❌ NFT deployment failed:", error);
  process.exitCode = 1;
});
