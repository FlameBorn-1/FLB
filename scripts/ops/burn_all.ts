import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

type DeploymentFile = {
  FlameBornToken?: {
    proxy?: string;
    address?: string;
  };
};

function resolveDeploymentPath(networkName: string, chainId: bigint) {
  const primary = path.join("deployments", `${networkName}.json`);
  if (fs.existsSync(primary)) {
    return primary;
  }

  const fallback = path.join("deployments", `${chainId.toString()}.json`);
  if (fs.existsSync(fallback)) {
    return fallback;
  }

  throw new Error(`Missing deployments JSON for network ${networkName} (${chainId.toString()})`);
}

async function main() {
  const network = await ethers.provider.getNetwork();
  const deploymentPath = resolveDeploymentPath(network.name, network.chainId);
  const deploymentJson = JSON.parse(fs.readFileSync(deploymentPath, "utf8")) as DeploymentFile;

  const token = deploymentJson.FlameBornToken?.proxy ?? deploymentJson.FlameBornToken?.address;
  if (!token) {
    throw new Error("Missing FlameBornToken address in deployments JSON");
  }

  const [signer] = await ethers.getSigners();
  const me = await signer.getAddress();

  const erc20 = await ethers.getContractAt(
    [
      "function symbol() view returns(string)",
      "function decimals() view returns(uint8)",
      "function balanceOf(address) view returns(uint256)",
      "function burn(uint256)"
    ],
    token,
    signer
  );

  const [symbol, decimals, balance] = await Promise.all([
    erc20.symbol(),
    erc20.decimals(),
    erc20.balanceOf(me)
  ]);

  if (balance === 0n) {
    throw new Error(`Signer ${me} has 0 ${symbol}. Use the true holder key.`);
  }

  console.log(`Burning ${ethers.formatUnits(balance, decimals)} ${symbol} from ${me} on ${network.name}`);
  const tx = await erc20.burn(balance);
  const receipt = await tx.wait();
  console.log(`Burn transaction hash: ${receipt?.hash ?? tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
