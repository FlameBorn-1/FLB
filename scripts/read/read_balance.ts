import { ethers } from "hardhat";
import fs from "fs";

(async () => {
  const address = process.env.ADDR;
  if (!address) {
    throw new Error("Provide ADDR=0x... as an environment variable.");
  }

  const network = await ethers.provider.getNetwork();
  const filePath = `deployments/${network.name}.json`;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Deployment manifest ${filePath} not found.`);
  }

  const manifest = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const tokenAddress = manifest.FlameBornToken?.proxy ?? manifest.FlameBornToken?.address;

  if (!tokenAddress) {
    throw new Error("FlameBornToken address missing in deployment manifest.");
  }

  const erc20 = await ethers.getContractAt(
    [
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address) view returns (uint256)"
    ],
    tokenAddress
  );

  const [symbol, decimals, rawBalance] = await Promise.all([
    erc20.symbol(),
    erc20.decimals(),
    erc20.balanceOf(address)
  ]);

  console.log(`${symbol} balance of ${address}: ${ethers.formatUnits(rawBalance, decimals)}`);
})();
