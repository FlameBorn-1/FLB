import { ethers, upgrades } from "hardhat";
import fs from "fs";

type DeploymentFile = {
  network: string;
  chainId: number;
  FlameBornToken?: {
    proxy?: string;
    implementation?: string;
    address?: string;
    version?: string;
  };
  FlameBornEngine?: {
    proxy?: string;
    implementation?: string;
    address?: string;
    version?: string;
  };
  FlameBornHealthIDNFT?: {
    address: string;
    version?: string;
  };
};

async function main() {
  const network = await ethers.provider.getNetwork();
  const filePath = `deployments/${network.name}.json`;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing deployment manifest at ${filePath}. Run 001_deploy_token.ts first.`);
  }

  const manifest: DeploymentFile = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (manifest.FlameBornEngine?.proxy || manifest.FlameBornEngine?.address) {
    const existing = manifest.FlameBornEngine.proxy ?? manifest.FlameBornEngine.address;
    console.log(`FlameBornEngine already deployed at ${existing}`);
    return;
  }

  const tokenAddress = manifest.FlameBornToken?.proxy ?? manifest.FlameBornToken?.address;
  if (!tokenAddress) {
    throw new Error("FlameBornToken address missing in deployment manifest.");
  }

  const nftAddress = manifest.FlameBornHealthIDNFT?.address;
  if (!nftAddress) {
    throw new Error("FlameBornHealthIDNFT address missing in deployment manifest.");
  }

  const admin = process.env.ENGINE_ADMIN || process.env.MULTISIG;
  if (!admin) {
    throw new Error("ENGINE_ADMIN or MULTISIG environment variable must be set.");
  }

  const actorReward = process.env.ACTOR_REWARD ?? "0";
  const donationRewardRate = process.env.DONATION_REWARD_RATE ?? "0";

  const actorRewardUnits = ethers.parseUnits(actorReward, 18);
  const donationRewardUnits = ethers.parseUnits(donationRewardRate, 18);

  const Engine = await ethers.getContractFactory("FlameBornEngine");
  const engine = await upgrades.deployProxy(
    Engine,
    [admin, tokenAddress, nftAddress, actorRewardUnits, donationRewardUnits],
    { initializer: "initialize", kind: "uups" }
  );

  await engine.waitForDeployment();

  const proxyAddress = await engine.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  manifest.FlameBornEngine = {
    proxy: proxyAddress,
    implementation: implementationAddress,
    address: proxyAddress,
    version: "1.0.0"
  };

  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));

  console.log("FlameBornEngine proxy:", proxyAddress);
  console.log("Implementation:", implementationAddress);
  console.log("Deployment info saved to", filePath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
