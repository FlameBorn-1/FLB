import { ethers, upgrades, run } from "hardhat";
import * as fs from 'fs';
import { join } from 'path';
import { Signer } from "ethers";

// --- Configuration ---
// Best practice: Move this to separate JSON files per network (e.g., deployments/alfajores.config.json)
const config = {
  // Celo Alfajores Testnet
  alfajores: {
    flbTokenAddress: "0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1",
    healthIdNftAddress: "0x1566c75a1Bad93a9fa5E2Da690395987E36e08e8",
    actorReward: ethers.parseUnits("100", 18), // 100 FLB
    donationRewardRate: 100n, // 100 FLB per base unit of native currency (e.g., WEI for CELO)
  },
  // Add other networks like 'mainnet' or 'localhost' here
  localhost: {
    // NOTE: These addresses are placeholders. You would deploy new mocks or use existing ones.
    flbTokenAddress: "0x0000000000000000000000000000000000000000",
    healthIdNftAddress: "0x0000000000000000000000000000000000000000",
    actorReward: ethers.parseUnits("100", 18),
    donationRewardRate: 100n,
  }
};

// --- Helper Functions ---

/**
 * Saves deployment information to a file, updating existing data.
 */
function saveDeploymentInfo(network: string, deploymentInfo: object): void {
  const deploymentsDir = join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filename = join(deploymentsDir, `${network}.json`);
  const existingData = fs.existsSync(filename)
    ? JSON.parse(fs.readFileSync(filename, 'utf-8'))
    : {};

  const updatedData = { ...existingData, ...deploymentInfo };
  
  fs.writeFileSync(filename, JSON.stringify(updatedData, null, 2));
  console.log(`✅ Deployment info saved to ${filename}`);
}

/**
 * Verifies a contract on the block explorer.
 */
async function verifyContract(address: string): Promise<void> {
  console.log(`\n🔍 Verifying contract at ${address}...`);
  try {
    // Wait for a few blocks to ensure the contract is propagated on the network
    console.log("Waiting 30 seconds for block explorer to index the contract...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    await run("verify:verify", {
      address: address,
      constructorArguments: [], // No constructor args for the implementation
    });
    console.log("✅ Contract verified successfully!");
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("✅ Contract is already verified.");
    } else {
      console.error("❌ Verification failed:", error.message);
    }
  }
}

async function checkPrerequisites(deployer: Signer) {
    console.log("Deploying with account:", await deployer.getAddress());
    const balance = await ethers.provider.getBalance(deployer);
    console.log("Account balance:", ethers.formatEther(balance), "CELO");

    if (balance === 0n) {
        throw new Error("❌ Deployer account has no CELO. Please fund your account.");
    }
}

async function main() {
  console.log("🚀 Starting FlameBornEngine upgrade script");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === 'unknown' || network.name === 'homestead' ? 'localhost' : network.name;

  console.log(`🔥 Upgrading FlameBornEngine on ${networkName} (Chain ID: ${network.chainId})...`);
  
  await checkPrerequisites(deployer);

  const networkConfig = (config as any)[networkName];
  if (!networkConfig) {
    throw new Error(`❌ No configuration found for network '${networkName}'.`);
  }

  const FlameBornEngine = await ethers.getContractFactory("FlameBornEngine");
  
  const proxyAddress = "0x82cA6C5FE9d7E834D908a2482aB76A51D64f5BB4";

  console.log("🚀 Upgrading proxy at:", proxyAddress);
  const engine = await upgrades.upgradeProxy(proxyAddress, FlameBornEngine);
  
  await engine.waitForDeployment();
  const engineAddress = await engine.getAddress();
  console.log("✅ FlameBornEngine (Proxy) upgraded at:", engineAddress);
  
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(engineAddress);
  console.log("🧠 New implementation address:", implementationAddress);
  
  const deploymentInfo = {
    FlameBornEngine: {
      address: engineAddress,
      implementation: implementationAddress,
      deployer: await deployer.getAddress(),
      timestamp: new Date().toISOString(),
      transactionHash: engine.deploymentTransaction()?.hash,
    }
  };

  saveDeploymentInfo(networkName, deploymentInfo);

  console.log("\n🌍 View on Celoscan:");
  console.log(`https://alfajores.celoscan.io/address/${engineAddress}`);
  
  if (networkName !== 'localhost' && networkName !== 'hardhat') {
    await verifyContract(implementationAddress);
  }
  
  console.log("\n🎉 Upgrade completed successfully!");
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exitCode = 1;
  });
}

export default main;