import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🔄 Force upgrading FlameBornEngine with new implementation...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Upgrading with account:", deployer.address);

  // Current proxy address
  const proxyAddress = "0x82cA6C5FE9d7E834D908a2482aB76A51D64f5BB4";

  console.log("📍 Current proxy address:", proxyAddress);

  try {
    // Get current implementation address
    const currentImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("🔧 Current implementation:", currentImpl);

    console.log("🚀 Deploying new implementation...");

    // Force upgrade by deploying new implementation
    const FlameBornEngine = await ethers.getContractFactory("FlameBornEngine");
    const upgraded = await upgrades.upgradeProxy(proxyAddress, FlameBornEngine, {
      kind: 'uups',
      call: { fn: 'engineTag', args: [] } // Force a call to ensure upgrade happens
    });
    await upgraded.waitForDeployment();

    console.log("✅ Force upgrade completed successfully!");

    // Get new implementation address
    const newImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("🔧 New implementation:", newImpl);

    // Verify the upgrade worked
    console.log("\n🔍 Verifying upgrade...");

    // Test the new functions
    try {
      const name = await upgraded.name();
      console.log("✅ Contract name:", name);
    } catch (error) {
      console.log("❌ name() function failed:", error.message);
    }

    try {
      const symbol = await upgraded.symbol();
      console.log("✅ Contract symbol:", symbol);
    } catch (error) {
      console.log("❌ symbol() function failed:", error.message);
    }

    try {
      const engineTag = await upgraded.engineTag();
      console.log("✅ Engine tag:", engineTag);
    } catch (error) {
      console.log("❌ engineTag() function failed:", error.message);
    }

    console.log("\n📊 Upgrade Summary:");
    console.log("- Proxy Address:", proxyAddress);
    console.log("- Old Implementation:", currentImpl);
    console.log("- New Implementation:", newImpl);

    if (currentImpl !== newImpl) {
      console.log("✅ Implementation successfully updated!");
    } else {
      console.log("⚠️ Implementation address same - upgrade may not have deployed new code");
    }

    console.log("\n🌍 View on Celoscan:");
    console.log(`https://alfajores.celoscan.io/address/${proxyAddress}`);

  } catch (error) {
    console.error("❌ Upgrade failed:", error);
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
