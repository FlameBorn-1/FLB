import { ethers } from "hardhat";
import fs from "fs";

type DeploymentManifest = {
  FlameBornToken?: { proxy?: string; address?: string };
};

(async () => {
  const network = await ethers.provider.getNetwork();
  const filePath = `deployments/${network.name}.json`;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Deployment manifest ${filePath} not found.`);
  }

  const manifest: DeploymentManifest = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const tokenAddress = manifest.FlameBornToken?.proxy ?? manifest.FlameBornToken?.address;

  if (!tokenAddress) {
    throw new Error("FlameBornToken address missing in deployment manifest.");
  }

  const erc20 = await ethers.getContractAt(
    [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)"
    ],
    tokenAddress
  );

  const [name, symbol, decimals, rawSupply] = await Promise.all([
    erc20.name(),
    erc20.symbol(),
    erc20.decimals(),
    erc20.totalSupply()
  ]);

  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Token:   ${name} (${symbol}) @ ${tokenAddress}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Total Supply: ${ethers.formatUnits(rawSupply, decimals)}`);
})();
