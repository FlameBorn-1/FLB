import { ethers } from "hardhat";
import fs from "fs";

type DeploymentManifest = {
  FlameBornToken?: { proxy?: string; address?: string };
  FlameBornEngine?: { proxy?: string; address?: string };
};

async function main() {
  const network = await ethers.provider.getNetwork();
  const filePath = `deployments/${network.name}.json`;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing deployment manifest at ${filePath}`);
  }

  const manifest: DeploymentManifest = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const tokenAddress = manifest.FlameBornToken?.proxy ?? manifest.FlameBornToken?.address;
  const engineAddress = manifest.FlameBornEngine?.address ?? manifest.FlameBornEngine?.proxy;

  if (!tokenAddress) {
    throw new Error("FlameBornToken address not found in manifest");
  }

  if (!engineAddress) {
    throw new Error("FlameBornEngine address not found in manifest");
  }

  const multisig = process.env.MULTISIG;
  if (!multisig) {
    throw new Error("MULTISIG environment variable must be set");
  }

  const token = await ethers.getContractAt("FlameBornToken", tokenAddress);
  const engine = await ethers.getContractAt("FlameBornEngine", engineAddress);

  if (token.MINTER_ROLE) {
    const minterRole = await token.MINTER_ROLE();
    const engineHasRole = await token.hasRole(minterRole, await engine.getAddress());
    if (!engineHasRole) {
      console.log("Granting MINTER_ROLE to FlameBornEngine...");
      await (await token.grantRole(minterRole, await engine.getAddress())).wait();
      console.log("MINTER_ROLE granted");
    } else {
      console.log("Engine already has MINTER_ROLE");
    }
  } else {
    console.log("Token does not expose MINTER_ROLE; skipping role grant");
  }

  if (token.DEFAULT_ADMIN_ROLE) {
    const adminRole = await token.DEFAULT_ADMIN_ROLE();
    const [signer] = await ethers.getSigners();
    const signerAddress = await signer.getAddress();

    const multisigHasAdmin = await token.hasRole(adminRole, multisig);
    if (!multisigHasAdmin) {
      console.log(`Granting DEFAULT_ADMIN_ROLE to multisig ${multisig}...`);
      await (await token.grantRole(adminRole, multisig)).wait();
      console.log("DEFAULT_ADMIN_ROLE granted to multisig");
    } else {
      console.log("Multisig already has DEFAULT_ADMIN_ROLE");
    }

    const signerHasAdmin = await token.hasRole(adminRole, signerAddress);
    if (signerHasAdmin) {
      console.log(`Renouncing DEFAULT_ADMIN_ROLE for deployer ${signerAddress}...`);
      await (await token.renounceRole(adminRole, signerAddress)).wait();
      console.log("DEFAULT_ADMIN_ROLE renounced by deployer");
    } else {
      console.log("Deployer does not hold DEFAULT_ADMIN_ROLE; nothing to renounce");
    }
  } else {
    console.log("Token does not expose DEFAULT_ADMIN_ROLE; skipping admin wiring");
  }

  console.log("Role wiring complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
