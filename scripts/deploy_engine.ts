import { ethers, upgrades } from "hardhat";
import { createDeployHelper } from "../utils/deployHelper";

async function main() {
  console.log("⚙️  Deploying FlameBornEngine...");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const helper = createDeployHelper(network.name);

  helper.setDeployer(deployer.address);

  // Check if already deployed
  if (helper.isDeployed("FlameBornEngine")) {
    const existingAddress = helper.getAddress("FlameBornEngine");
    console.log(`✅ FlameBornEngine already deployed at: ${existingAddress}`);
    console.log("⏭️  Skipping deployment");
    return existingAddress;
  }

  // Get required contract addresses
  const tokenAddress = helper.getAddress("FlameBornToken");
  const nftAddress = helper.getAddress("FlameBornHealthIDNFT");

  if (!tokenAddress) {
    throw new Error("❌ FlameBornToken not deployed yet. Run deploy_token.ts first.");
  }

  if (!nftAddress) {
    throw new Error("❌ FlameBornHealthIDNFT not deployed yet. Run deploy_healthidnft.ts first.");
  }

  console.log("🚀 Deploying new FlameBornEngine...");
  console.log(`   Using Token: ${tokenAddress}`);
  console.log(`   Using NFT: ${nftAddress}`);

  const Engine = await ethers.getContractFactory("FlameBornEngine");
  const engine = await upgrades.deployProxy(Engine, [
    deployer.address, // admin
    tokenAddress,     // FLB token
    nftAddress,       // HealthIDNFT
    ethers.parseEther("100"), // actorReward (100 FLB)
    1000 // donationRewardRate (1000 FLB per ETH)
  ], {
    initializer: "initialize",
    kind: "uups",
  });
  await engine.waitForDeployment();

  const engineAddress = await engine.getAddress();
  const engineImpl = await upgrades.erc1967.getImplementationAddress(engineAddress);
  const engineTx = engine.deploymentTransaction();

  console.log(`✅ FlameBornEngine Proxy deployed at: ${engineAddress}`);
  console.log(`   Implementation at: ${engineImpl}`);

  // Grant MINTER role to engine on token
  console.log("🔑 Granting MINTER role to engine on token...");
  const tokenContract = await ethers.getContractAt("FlameBornToken", tokenAddress);
  await tokenContract.grantRole(await tokenContract.MINTER_ROLE(), engineAddress);
  console.log("✅ Token MINTER role granted");

  // Grant MINTER role to engine on NFT
  console.log("🔑 Granting MINTER role to engine on NFT...");
  const nftContract = await ethers.getContractAt("FlameBornHealthIDNFT", nftAddress);
  await nftContract.grantRole(await nftContract.MINTER_ROLE(), engineAddress);
  console.log("✅ NFT MINTER role granted");

  // Save deployment info
  helper.saveDeployment("FlameBornEngine", engineAddress, engineTx?.hash, engineImpl);

  console.log("🎉 Engine deployment complete with permissions granted!");

  return engineAddress;
}

main().catch((error) => {
  console.error("❌ Engine deployment failed:", error);
  process.exitCode = 1;
});
