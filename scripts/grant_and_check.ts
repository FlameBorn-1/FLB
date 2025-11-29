import { ethers } from "hardhat";
import { createDeployHelper } from "../utils/deployHelper";

async function main() {
  console.log("🔬 Granting roles and running sanity check...");

  const network = await ethers.provider.getNetwork();
  const helper = createDeployHelper(network.name);

  const tokenAddress = helper.getAddress("FlameBornToken");
  const engineAddress = helper.getAddress("FlameBornEngine");

  if (!tokenAddress || !engineAddress) {
    throw new Error("Contract addresses not found in deployment file.");
  }

  // Grant Minter Role
  console.log("Granting Minter Role to the Engine...");
  const token = await ethers.getContractAt("FlameBornToken", tokenAddress);
  const minterRole = await token.MINTER_ROLE();
  const grantTx = await token.grantRole(minterRole, engineAddress);
  await grantTx.wait();
  console.log("Minter Role granted.");

  // Sanity Check
  console.log("Performing sanity check...");
  const totalSupply = await token.totalSupply();
  console.log(`Total supply is ${totalSupply.toString()}`);
  if (totalSupply.toString() !== "0") {
    throw new Error("Sanity check failed: Total supply should be 0");
  }

  const hasMinterRole = await token.hasRole(minterRole, engineAddress);
  console.log(`Engine has MINTER_ROLE: ${hasMinterRole}`);
  if (!hasMinterRole) {
    throw new Error("Sanity check failed: Engine should have MINTER_ROLE");
  }

  const minterCount = await token.getRoleMemberCount(minterRole);
  console.log(`There is/are ${minterCount.toString()} account(s) with MINTER_ROLE`);
  if (minterCount.toString() !== "1") {
    throw new Error("Sanity check failed: There should be only 1 account with MINTER_ROLE");
  }

  const minter = await token.getRoleMember(minterRole, 0);
  console.log(`The account with MINTER_ROLE is: ${minter}`);
  if (minter !== engineAddress) {
    throw new Error("Sanity check failed: The account with MINTER_ROLE should be the engine address");
  }

  const [deployer] = await ethers.getSigners();
  const deployerHasMinterRole = await token.hasRole(minterRole, deployer.address);
  console.log(`Deployer has MINTER_ROLE: ${deployerHasMinterRole}`);
  if (deployerHasMinterRole) {
      throw new Error("Sanity check failed: Deployer should not have MINTER_ROLE");
  }

  console.log("✅ Sanity check passed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
