import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("🚀 Starting test deployment script");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO");
  
  try {
    console.log("\n1. Compiling contracts...");
    await hre.run("compile");
    console.log("✅ Contracts compiled successfully");
    
    console.log("\n2. Deploying TestContract...");
    console.log("Getting contract factory...");
    const TestContract = await ethers.getContractFactory("TestContract");
    console.log("Deploying contract...");
    const testContract = await TestContract.deploy();
    await testContract.waitForDeployment();
    
    const address = await testContract.getAddress();
    console.log("✅ TestContract deployed to:", address);
    
    console.log("\n3. Testing contract interaction...");
    const greeting = await testContract.greeting();
    console.log("Initial greeting:", greeting);
    
    console.log("\n🎉 Test deployment completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Error during deployment:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
