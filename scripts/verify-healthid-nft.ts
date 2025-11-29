import hre from "hardhat";
import fs from "fs";

function loadManifest(networkName: string) {
  const path = `deployments/${networkName}.json`;
  if (!fs.existsSync(path)) {
    throw new Error(`Deployment manifest not found: ${path}`);
  }
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  const manifest = loadManifest(network.name);

  const nftAddress =
    manifest.FlameBornHealthIDNFT?.address || manifest.contracts?.FlameBornHealthIDNFT?.address;
  if (!nftAddress) {
    throw new Error("FlameBornHealthIDNFT address missing in manifest.");
  }

  const admin =
    manifest.roles?.FlameBornHealthIDNFT?.DEFAULT_ADMIN_ROLE?.[0] ||
    manifest.deployer ||
    process.env.BACKEND_WALLET_ADDRESS;

  if (!admin) {
    throw new Error("Admin address not found (manifest.roles.FHID DEFAULT_ADMIN_ROLE or BACKEND_WALLET_ADDRESS).");
  }

  console.log(`🔍 Verifying FlameBornHealthIDNFT at ${nftAddress} with admin ${admin}...`);

  try {
    await hre.run("verify:verify", {
      address: nftAddress,
      constructorArguments: [admin],
      contract: "contracts/nft/FlameBornHealthIDNFT.sol:FlameBornHealthIDNFT"
    });
    console.log("✅ HealthID NFT verified!");
  } catch (error: any) {
    console.error("❌ Verification failed:", error?.message || error);
    process.exitCode = 1;
  }
}

main();
