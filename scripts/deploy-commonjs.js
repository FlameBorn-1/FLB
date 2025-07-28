const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Starting simplified deployment script (CommonJS)");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO");
  
  if (balance === 0n) {
    throw new Error("Insufficient balance. Please fund your account with testnet CELO.");
  }
  
  try {
    console.log("\n1. Compiling contracts...");
    await hre.run("compile");
    console.log("✅ Contracts compiled successfully");
    
    console.log("\n2. Getting contract factory...");
    const FlameBornEngine = await ethers.getContractFactory("FlameBornEngine");
    console.log("✅ Contract factory obtained");
    
    console.log("\n3. Deploying contract...");
    const args = [
      deployer.address, // admin
      "0xd1b6883205eF7021723334D4ec0dc68D0D156b2a", // FLB token
      "0x115aA20101bd0F95516Cc67ea104eD0B0c642919", // HealthIDNFT
      ethers.parseUnits("100", 18), // actorReward (100 FLB)
      100 // donationRewardRate (100 FLB per ETH)
    ];
    
    console.log("Deployment arguments:", args);
    
    const engine = await upgrades.deployProxy(FlameBornEngine, args, {
      initializer: "initialize",
      kind: "uups"
    });
    
    console.log("✅ Contract deployment transaction sent");
    
    console.log("\n4. Waiting for deployment confirmation...");
    await engine.waitForDeployment();
    
    const address = await engine.getAddress();
    console.log("✅ Contract deployed to:", address);
    
    console.log("\n🎉 Deployment completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
