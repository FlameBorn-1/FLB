import { ethers } from "hardhat";

async function main() {
  // Replace with your deployed contract address
  const contractAddress = process.argv[2];
  
  if (!contractAddress) {
    console.error("❌ Please provide the contract address as an argument");
    console.log("Usage: npx hardhat run scripts/verify_deployment.ts --network alfajores <CONTRACT_ADDRESS>");
    process.exit(1);
  }

  console.log("🔍 Verifying FlameBornToken deployment...");
  console.log("📍 Contract Address:", contractAddress);

  try {
    // Get the contract instance
    const FlameBornToken = await ethers.getContractFactory("FlameBornToken");
    const flameBornToken = FlameBornToken.attach(contractAddress);

    // Verify basic contract info
    console.log("\n✅ Contract Information:");
    const name = await flameBornToken.name();
    const symbol = await flameBornToken.symbol();
    const decimals = await flameBornToken.decimals();
    const totalSupply = await flameBornToken.totalSupply();
    const owner = await flameBornToken.owner();

    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Decimals:", decimals);
    console.log("- Total Supply:", ethers.formatEther(totalSupply), "FLB");
    console.log("- Owner:", owner);

    // Check owner balance
    const ownerBalance = await flameBornToken.balanceOf(owner);
    console.log("- Owner Balance:", ethers.formatEther(ownerBalance), "FLB");

    // Check if contract is paused
    const isPaused = await flameBornToken.paused();
    console.log("- Is Paused:", isPaused);

    // Test basic functionality (read-only)
    console.log("\n🧪 Testing Contract Functions:");
    
    // Test allowance (should be 0 for random addresses)
    const [signer] = await ethers.getSigners();
    const allowance = await flameBornToken.allowance(owner, signer.address);
    console.log("- Allowance (owner -> signer):", ethers.formatEther(allowance), "FLB");

    // Check if we can get domain separator (EIP-712)
    try {
      const domainSeparator = await flameBornToken.DOMAIN_SEPARATOR();
      console.log("- Domain Separator:", domainSeparator);
    } catch (error) {
      console.log("- Domain Separator: Not available");
    }

    console.log("\n🎉 Contract verification completed successfully!");
    console.log("🌍 View on Celoscan:");
    console.log(`https://alfajores.celoscan.io/address/${contractAddress}`);

  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
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