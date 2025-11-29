import { ethers } from "hardhat";

async function main() {
  const proposalId = process.env.PROPOSAL_ID;
  const governorAddress = process.env.GOVERNOR;

  if (!proposalId) throw new Error("Set PROPOSAL_ID env var");
  if (!governorAddress) throw new Error("Set GOVERNOR env var");

  const args = process.argv.slice(2);
  const queueOnly = args.includes("--queue") && !args.includes("--execute");
  const executeOnly = args.includes("--execute") && !args.includes("--queue");

  const governor = await ethers.getContractAt(
    [
      "function queue(uint256) external",
      "function execute(uint256) external payable",
      "function state(uint256) view returns (uint8)"
    ],
    governorAddress
  );

  console.log("Current state:", await governor.state(proposalId));

  if (queueOnly || (!queueOnly && !executeOnly)) {
    const queueTx = await governor.queue(proposalId);
    await queueTx.wait();
    console.log("Queued", queueTx.hash);
  }

  if (executeOnly || (!queueOnly && !executeOnly)) {
    const executeTx = await governor.execute(proposalId, { value: 0 });
    await executeTx.wait();
    console.log("Executed", executeTx.hash);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
