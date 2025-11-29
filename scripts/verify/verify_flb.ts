import { run } from "hardhat";

async function main() {
  const address = process.env.FLB_ADDR;
  const admin = process.env.FLB_ADMIN;

  if (!address) throw new Error("Set FLB_ADDR=token_address");
  if (!admin) throw new Error("Set FLB_ADMIN=constructor admin address");

  await run("verify:verify", {
    address,
    constructorArguments: [admin]
  });

  console.log(`Verification request submitted for ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
