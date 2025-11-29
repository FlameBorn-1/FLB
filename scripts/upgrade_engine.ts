import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🔄 Upgrading FlameBornEngine to add name() and symbol() functions...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Upgrading with account:", deployer.address);

  // Current proxy address
  const proxyAddress = "0x82cA6C5FE9d7E834D908a2482aB76A51D64f5BB4";

  console.log("📍 Current proxy address:", proxyAddress);

  try {
    console.log("🔧 Force importing existing proxy...");

    // First, force import the existing proxy to register it with Hardhat upgrades
    const FlameBornEngine = await ethers.getContractFactory("FlameBornEngine");
    await upgrades.forceImport(proxyAddress, FlameBornEngine);
    console.log("✅ Proxy registered with Hardhat upgrades");

    // Get current implementation address
    const currentImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("🔧 Current implementation:", currentImpl);

    console.log("🚀 Preparing upgrade...");

    // Upgrade the proxy to new implementation
    console.log("🔄 Upgrading proxy...");
    const upgraded = await upgrades.upgradeProxy(proxyAddress, FlameBornEngine);
    await upgraded.waitForDeployment();

    console.log("✅ Upgrade completed successfully!");

    // Get new implementation address
    const newImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("🔧 New implementation:", newImpl);

    // Verify the upgrade worked
    console.log("\n🔍 Verifying upgrade...");
    const name = await upgraded.name();
    const symbol = await upgraded.symbol();
    const engineTag = await upgraded.engineTag();

    console.log("✅ Contract name:", name);
    console.log("✅ Contract symbol:", symbol);
    console.log("✅ Engine tag:", engineTag);

    console.log("\n📊 Upgrade Summary:");
    console.log("- Proxy Address:", proxyAddress);
    console.log("- Old Implementation:", currentImpl);
    console.log("- New Implementation:", newImpl);
    console.log("- Contract Name:", name);
    console.log("- Contract Symbol:", symbol);

    console.log("\n🌍 View on Celoscan:");
    console.log(`https://alfajores.celoscan.io/address/${proxyAddress}`);

    console.log("\n🎉 Upgrade completed successfully!");
    console.log("💡 CeloScan should now display 'FlameBornEngine (FLB-EN)' for the contract");

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
