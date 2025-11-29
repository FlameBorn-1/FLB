import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { ethers } from "hardhat";

async function main() {
  console.log("🔥 Starting Genesis Clean Deployment...");

  const network = await ethers.provider.getNetwork();
  const deploymentFilePath = path.join(__dirname, "..", "deployments", `${network.name}.json`);

  // 1. Clean previous deployment
  if (fs.existsSync(deploymentFilePath)) {
    console.log("1️⃣  Cleaning previous deployment...");
    fs.unlinkSync(deploymentFilePath);
  }

  // 2. Clean workspace and recompile
  console.log("2️⃣  Cleaning workspace and recompiling...");
  execSync("npx hardhat clean && npx hardhat compile", { stdio: "inherit" });

  // 3. Deploy all contracts
  console.log("3️⃣  Deploying all contracts...");
  execSync("npx hardhat run scripts/deploy_all.ts --network " + network.name, { stdio: "inherit" });

  // 4. Grant roles and run sanity check
  console.log("4️⃣  Granting roles and running sanity check...");
  execSync("npx hardhat run scripts/grant_and_check.ts --network " + network.name, { stdio: "inherit" });

  console.log("🔥 Genesis Clean Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
