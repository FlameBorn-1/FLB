import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const recipient = process.env.MINT_TO;
  const humanAmount = process.env.MINT_AMOUNT;

  if (!recipient) {
    throw new Error("Set MINT_TO=0x... on the environment");
  }
  if (!humanAmount) {
    throw new Error("Set MINT_AMOUNT=<amount in FLB>");
  }

  const network = await ethers.provider.getNetwork();
  const filePath = `deployments/${network.name}.json`;
  if (!fs.existsSync(filePath)) {
    throw new Error(`Deployment manifest ${filePath} not found.`);
  }

  const manifest = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const tokenAddress = manifest.FlameBornToken?.proxy ?? manifest.FlameBornToken?.address;
  const engineAddress = manifest.FlameBornEngine?.address ?? manifest.FlameBornEngine?.proxy;
  const governanceAddress = manifest.Governance?.address ?? process.env.GOVERNOR;

  if (!tokenAddress) throw new Error("FlameBornToken address missing in manifest");
  if (!engineAddress) throw new Error("FlameBornEngine address missing in manifest");
  if (!governanceAddress) throw new Error("Provide Governance address via manifest or GOVENOR env var");

  const token = await ethers.getContractAt(
    [
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)"
    ],
    tokenAddress
  );
  const [symbol, decimals] = await Promise.all([token.symbol(), token.decimals()]);
  const amount = ethers.parseUnits(humanAmount, decimals);

  const engine = await ethers.getContractAt(["function mint(address,uint256)"], engineAddress);
  const calldata = engine.interface.encodeFunctionData("mint", [recipient, amount]);

  const governor = await ethers.getContractAt(
    [
      "function propose(address[] targets,uint256[] values,bytes[] calldatas,string description) returns (uint256)"
    ],
    governanceAddress
  );

  const tx = await governor.propose([engineAddress], [0], [calldata], `Mint ${humanAmount} ${symbol} to ${recipient}`);
  const receipt = await tx.wait();

  console.log("Submitted proposal", receipt?.hash ?? tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
