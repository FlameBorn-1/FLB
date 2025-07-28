import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🔥 Deploying FlameBornToken to Celo Alfajores...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO");
  
  if (balance === 0n) {
    throw new Error("❌ Deployer account has no CELO. Please fund your account with Alfajores testnet CELO.");
  }

  // Get the contract factory
  const FlameBornToken = await ethers.getContractFactory("FlameBornToken");
  
  console.log("📋 Contract deployment parameters:");
  console.log("- Initial Owner:", deployer.address);
  console.log("- Token Name: FlameBornToken");
  console.log("- Token Symbol: FLB");
  console.log("- Initial Supply: 1,000,000 FLB");
  
  try {
    // Deploy the upgradeable proxy
    console.log("🚀 Deploying upgradeable proxy...");
    const deployedFlameBornToken = await upgrades.deployProxy(
      FlameBornToken,
      [deployer.address], // initialOwner
      {
        initializer: "initialize",
        kind: "uups",
      }
    );

    await deployedFlameBornToken.waitForDeployment();
    const proxyAddress = await deployedFlameBornToken.getAddress();

    console.log("✅ FlameBornToken deployed successfully!");
    console.log("📍 Proxy Address:", proxyAddress);
    
    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("🔧 Implementation Address:", implementationAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const name = await deployedFlameBornToken.name();
    const symbol = await deployedFlameBornToken.symbol();
    const totalSupply = await deployedFlameBornToken.totalSupply();
    const owner = await deployedFlameBornToken.owner();
    const decimals = await deployedFlameBornToken.decimals();
    
    console.log("✅ Deployment verification:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Decimals:", decimals);
    console.log("- Total Supply:", ethers.formatEther(totalSupply), "FLB");
    console.log("- Owner:", owner);
    console.log("- Owner Balance:", ethers.formatEther(await deployedFlameBornToken.balanceOf(owner)), "FLB");

    // Get deployment transaction
    const deploymentTx = deployedFlameBornToken.deploymentTransaction();

    // Save deployment info
    const deploymentInfo = {
      network: "alfajores",
      chainId: 44787,
      contractName: "FlameBornToken",
      proxyAddress: proxyAddress,
      implementationAddress: implementationAddress,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      transactionHash: deploymentTx?.hash || "N/A",
      blockNumber: deploymentTx?.blockNumber || "N/A",
      gasUsed: deploymentTx?.gasLimit?.toString() || "N/A",
      tokenDetails: {
        name: name,
        symbol: symbol,
        decimals: decimals,
        totalSupply: totalSupply.toString(),
        initialOwner: owner
      }
    };

    console.log("\n📄 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2));
    
    console.log("\n🌍 View on Celoscan:");
    console.log(`https://alfajores.celoscan.io/address/${proxyAddress}`);
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("💡 Next steps:");
    console.log("1. Verify the contract on Celoscan");
    console.log("2. Test token functionality (transfer, burn, pause)");
    console.log("3. Set up governance if needed");

    return {
      proxy: proxyAddress,
      implementation: implementationAddress,
      deployer: deployer.address
    };
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}

export default main;