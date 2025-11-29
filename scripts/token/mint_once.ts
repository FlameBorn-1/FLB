import { ethers } from "hardhat";

async function main() {
  const tokenAddress = process.env.FLB_ADDR;
  const recipient = process.env.TO;
  const rawAmount = process.env.AMOUNT;

  if (!tokenAddress) {
    throw new Error("Set FLB_ADDR=token_proxy_address in the environment");
  }

  if (!recipient) {
    throw new Error("Set TO=recipient_address in the environment");
  }

  if (!rawAmount) {
    throw new Error("Set AMOUNT=<uint256 amount> in the environment");
  }

  const amount = BigInt(rawAmount);
  if (amount === 0n) {
    throw new Error("AMOUNT must be greater than zero");
  }

  const token = await ethers.getContractAt("FlameBornToken", tokenAddress);
  const tx = await token.mint(recipient, amount);
  const receipt = await tx.wait();

  console.log(`Minted ${amount.toString()} wei of FLB to ${recipient}`);
  console.log(`Transaction hash: ${receipt?.hash ?? tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
