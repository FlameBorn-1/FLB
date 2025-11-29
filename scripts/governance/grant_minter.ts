import { ethers } from "hardhat";

async function main() {
  const tokenAddress = process.env.FLB_ADDR;
  const ENGINE_ADDRESS = process.env.ENGINE_ADDRESS;

  if (!tokenAddress) {
    throw new Error("Set FLB_ADDR=token_proxy_address in the environment");
  }

  if (!ENGINE_ADDRESS) {
    throw new Error("Set FLB_ENGINE_ADDR=address_to_grant in the environment");
  }

  const token = await ethers.getContractAt("FlameBornToken", tokenAddress);
  const role = await token.FLB_ENGINE_ADDR_ROLE();

  const hasRole = await token.hasRole(role, ENGINE_ADDRESS);
  if (hasRole) {
    console.log(`Address ${ENGINE_ADDRESS} already has FLB_ENGINE_ADDR_ROLE.`);
    return;
  }

  const tx = await token.grantRole(role, ENGINE_ADDRESS);
  const receipt = await tx.wait();

  console.log(`Granted FLB_ENGINE_ADDR_ROLE to ${ENGINE_ADDRESS}. Tx hash: ${receipt?.hash ?? tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
