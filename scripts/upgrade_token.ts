import { ethers, upgrades } from "hardhat";

async function main() {
  const proxyAddress = "0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1";
  console.log(`🔥 Importing and Upgrading FlameBornToken at: ${proxyAddress}`);

  const Token = await ethers.getContractFactory("FlameBornToken");

  // First, import the existing proxy
  try {
    await upgrades.forceImport(proxyAddress, Token, { kind: 'uups' });
    console.log(`✅ Proxy at ${proxyAddress} imported.`);
  } catch (e) {
    if (e.message.includes('is already registered')) {
        console.log('Proxy already registered, skipping import.');
    } else {
        throw e;
    }
  }

  // Then, upgrade it
  const token = await upgrades.upgradeProxy(proxyAddress, Token);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  const tokenImpl = await upgrades.erc1967.getImplementationAddress(tokenAddress);

  console.log(`✅ FlameBornToken upgraded`);
  console.log(`   Proxy at: ${tokenAddress}`);
  console.log(`   New implementation at: ${tokenImpl}`);
}

main().catch((error) => {
  console.error("❌ Token upgrade failed:", error);
  process.exitCode = 1;
});