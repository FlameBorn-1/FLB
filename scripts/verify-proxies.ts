import hre from "hardhat";
import fs from "fs";

const { ethers } = hre;

function loadManifest(networkName: string) {
  const path = `deployments/${networkName}.json`;
  if (!fs.existsSync(path)) {
    throw new Error(`Deployment manifest not found: ${path}`);
  }
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

async function verifyProxy(proxy: string, logic: string, data: string, label: string) {
  try {
    await hre.run("verify:verify", {
      address: proxy,
      constructorArguments: [logic, data],
      contract: "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy"
    });
    console.log(`✅ ${label} proxy verified!`);
  } catch (error: any) {
    console.log(`⚠️  ${label} proxy skipped: ${error?.message || error}`);
  }
}

async function main() {
  const network = await ethers.provider.getNetwork();
  const manifest = loadManifest(network.name);

  const admin = manifest.deployer || process.env.BACKEND_WALLET_ADDRESS;
  if (!admin) {
    throw new Error("Admin address missing (manifest.deployer or BACKEND_WALLET_ADDRESS).");
  }

  const tokenProxy = manifest.FlameBornToken?.proxy || manifest.contracts?.FlameBornToken?.proxy;
  const tokenImpl =
    manifest.FlameBornToken?.implementation || manifest.contracts?.FlameBornToken?.implementation;
  if (tokenProxy && tokenImpl) {
    const tokenIface = (await ethers.getContractFactory("FlameBornToken")).interface;
    const initData = tokenIface.encodeFunctionData("initialize", [admin]);
    console.log(`🔍 Verifying FlameBorn Token proxy ${tokenProxy}...`);
    await verifyProxy(tokenProxy, tokenImpl, initData, "FlameBorn Token");
  } else {
    console.log("⚠️  Token proxy/implementation missing in manifest; skipping token proxy verification.");
  }

  const engineProxy = manifest.FlameBornEngine?.proxy || manifest.contracts?.FlameBornEngine?.proxy;
  const engineImpl =
    manifest.FlameBornEngine?.implementation || manifest.contracts?.FlameBornEngine?.implementation;
  const nftAddress =
    manifest.FlameBornHealthIDNFT?.address || manifest.contracts?.FlameBornHealthIDNFT?.address;

  if (engineProxy && engineImpl && tokenProxy && nftAddress) {
    const engineIface = (await ethers.getContractFactory("FlameBornEngine")).interface;
    const initData = engineIface.encodeFunctionData("initialize", [
      admin,
      tokenProxy,
      nftAddress,
      ethers.parseEther("100"),
      1000
    ]);
    console.log(`🔍 Verifying FlameBorn Engine proxy ${engineProxy}...`);
    await verifyProxy(engineProxy, engineImpl, initData, "FlameBorn Engine");
  } else {
    console.log("⚠️  Engine proxy/implementation or dependencies missing; skipping engine proxy verification.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
