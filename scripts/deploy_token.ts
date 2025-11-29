import { ethers, upgrades } from "hardhat";
import { createDeployHelper } from "../utils/deployHelper";

async function main() {
  console.log("🔥 Deploying FlameBornToken...");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const helper = createDeployHelper(network.name);

  helper.setDeployer(deployer.address);

  // Check if already deployed
  if (helper.isDeployed("FlameBornToken")) {
    const existingAddress = helper.getAddress("FlameBornToken");
    console.log(`✅ FlameBornToken already deployed at: ${existingAddress}`);
    console.log("⏭️  Skipping deployment");
    return existingAddress;
  }

  console.log("🚀 Deploying new FlameBornToken...");

  const Token = await ethers.getContractFactory("FlameBornToken");
  const token = await upgrades.deployProxy(Token, [deployer.address], {
    initializer: "initialize",
    kind: "uups",
  });
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  const tokenImpl = await upgrades.erc1967.getImplementationAddress(tokenAddress);
  const tokenTx = token.deploymentTransaction();

  console.log(`✅ FlameBornToken Proxy deployed at: ${tokenAddress}`);
  console.log(`   Implementation at: ${tokenImpl}`);

  // Save deployment info
  helper.saveDeployment("FlameBornToken", tokenAddress, tokenTx?.hash, tokenImpl);

  return tokenAddress;
}

main().catch((error) => {
  console.error("❌ Token deployment failed:", error);
  process.exitCode = 1;
});
