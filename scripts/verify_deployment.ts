import { ethers } from "hardhat";

const TOKEN_ADDRESS = "0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1";
const contractAddress = TOKEN_ADDRESS;

async function main() {
  console.log("🔍 Verifying FlameBornToken deployment.");
  console.log("📍 Contract Address:", TOKEN_ADDRESS);

  try {
    const FlameBornToken = await ethers.getContractFactory("FlameBornToken");
    const tokenContract = FlameBornToken.attach(contractAddress) as any;

    // Verify basic contract info
    console.log("\n✅ Contract Information:");
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const totalSupply = await tokenContract.totalSupply();
    const owner = await tokenContract.owner();

    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Decimals:", decimals);
    console.log("- Total Supply:", ethers.formatEther(totalSupply), "FLB");
    console.log("- Owner:", owner);

    // Check owner balance
    const ownerBalance = await tokenContract.balanceOf(owner);
    console.log("- Owner Balance:", ethers.formatEther(ownerBalance), "FLB");

    // Check if contract is paused
    const isPaused = await tokenContract.paused();
    console.log("- Is Paused:", isPaused);

    // Test basic functionality (read-only)
    console.log("\n🧪 Testing Contract Functions:");

    // Test allowance (should be 0 for random addresses)
    const [signer] = await ethers.getSigners();
    const allowance = await tokenContract.allowance(owner, signer.address);
    console.log("- Allowance (owner -> signer):", ethers.formatEther(allowance), "FLB");

    // Check if we can get domain separator (EIP-712)
    try {
      const domainSeparator = await tokenContract.DOMAIN_SEPARATOR();
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