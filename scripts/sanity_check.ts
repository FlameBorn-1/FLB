
import { ethers } from "hardhat";

async function main() {
  const tokenAddress = "0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1";
  const engineAddress = "0x82cA6C5FE9d7E834D908a2482aB76A51D64f5BB4";
  const deployerAddress = "0x2E75287C542B9b111906D961d58f2617059dDe3c";

  const flameBornToken = await ethers.getContractAt("FlameBornToken", tokenAddress);

  console.log("🔬 Performing sanity check...");

  // 1. Check total supply
  const totalSupply = await flameBornToken.totalSupply();
  console.log(`✅ Total supply is ${totalSupply.toString()}`);
  if (totalSupply.toString() !== "0") {
    console.error("❌ Sanity check failed: Total supply should be 0");
  }

  // 2. Check MINTER_ROLE
  const minterRole = await flameBornToken.MINTER_ROLE();
  const hasMinterRole = await flameBornToken.hasRole(minterRole, engineAddress);
  console.log(`✅ Engine has MINTER_ROLE: ${hasMinterRole}`);
  if (!hasMinterRole) {
    console.error("❌ Sanity check failed: Engine should have MINTER_ROLE");
  }

  // 3. Check that only the engine has the MINTER_ROLE
  const minterCount = await flameBornToken.getRoleMemberCount(minterRole);
  console.log(`✅ There is/are ${minterCount.toString()} account(s) with MINTER_ROLE`);
  if (minterCount.toString() !== "1") {
    console.error("❌ Sanity check failed: There should be only 1 account with MINTER_ROLE");
  }

  const minter = await flameBornToken.getRoleMember(minterRole, 0);
  console.log(`✅ The account with MINTER_ROLE is: ${minter}`);
  if (minter !== engineAddress) {
    console.error("❌ Sanity check failed: The account with MINTER_ROLE should be the engine address");
  }

  // 4. Check that the deployer does not have the MINTER_ROLE
  const deployerHasMinterRole = await flameBornToken.hasRole(minterRole, deployerAddress);
  console.log(`✅ Deployer has MINTER_ROLE: ${deployerHasMinterRole}`);
  if (deployerHasMinterRole) {
      console.error("❌ Sanity check failed: Deployer should not have MINTER_ROLE");
  }

  console.log("🔬 Sanity check complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
