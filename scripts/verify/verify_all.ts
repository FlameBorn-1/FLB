import { ethers, run } from "hardhat";
import fs from "fs";

async function verify(address: string, ctor: unknown[] = [], contract?: string) {
  try {
    await run("verify:verify", { address, constructorArguments: ctor, contract });
    console.log(`✅ Verified ${address}`);
  } catch (error: any) {
    console.log(`ℹ️  Skip ${address}: ${error.message}`);
  }
}

async function main() {
  const network = await ethers.provider.getNetwork();
  const filePath = `deployments/${network.name}.json`;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Deployment manifest ${filePath} not found.`);
  }

  const manifest = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const contracts = {
    FlameBornToken: manifest.FlameBornToken || manifest.contracts?.FlameBornToken,
    FlameBornEngine: manifest.FlameBornEngine || manifest.contracts?.FlameBornEngine,
    FlameBornHealthIDNFT: manifest.FlameBornHealthIDNFT || manifest.contracts?.FlameBornHealthIDNFT
  };

  if (contracts.FlameBornToken?.implementation) {
    await verify(contracts.FlameBornToken.implementation);
  }
  if (contracts.FlameBornToken?.proxy) {
    console.log(
      "ℹ️  Skipping automatic proxy verification for FlameBornToken. Provide constructor data via TOKEN_PROXY_DATA env if needed."
    );
  }

  if (contracts.FlameBornEngine?.implementation) {
    await verify(contracts.FlameBornEngine.implementation);
  }
  if (contracts.FlameBornEngine?.proxy) {
    console.log(
      "ℹ️  Skipping automatic proxy verification for FlameBornEngine. Provide constructor data via ENGINE_PROXY_DATA env if needed."
    );
  }

  if (contracts.FlameBornHealthIDNFT?.address) {
    await verify(contracts.FlameBornHealthIDNFT.address, []);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});