import { ethers } from "hardhat";

async function main() {
  console.log("🏥 Deploying HealthIDNFT to Celo Alfajores...");
  
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
  const HealthIDNFT = await ethers.getContractFactory("HealthIDNFT");
  
  console.log("📋 Contract deployment parameters:");
  console.log("- Admin Address:", deployer.address);
  console.log("- Contract Name: HealthIDNFT");
  console.log("- Contract Symbol: HEALTH");
  console.log("- Type: Soulbound NFT (Non-transferable)");
  
  try {
    // Deploy the contract
    console.log("🚀 Deploying HealthIDNFT contract...");
    const healthIDNFT = await HealthIDNFT.deploy(deployer.address);

    await healthIDNFT.waitForDeployment();
    const contractAddress = await healthIDNFT.getAddress();

    console.log("✅ HealthIDNFT deployed successfully!");
    console.log("📍 Contract Address:", contractAddress);
    
    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const name = await (healthIDNFT as any).name();
    const symbol = await (healthIDNFT as any).symbol();
    const totalSupply = await (healthIDNFT as any).totalSupply();
    const currentTokenId = await (healthIDNFT as any).getCurrentTokenId();
    
    // Check roles
    const DEFAULT_ADMIN_ROLE = await (healthIDNFT as any).DEFAULT_ADMIN_ROLE();
    const MINTER_ROLE = await (healthIDNFT as any).MINTER_ROLE();
    const MULTISIG_ROLE = await (healthIDNFT as any).MULTISIG_ROLE();
    
    const hasAdminRole = await (healthIDNFT as any).hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const hasMinterRole = await (healthIDNFT as any).hasRole(MINTER_ROLE, deployer.address);
    const hasMultisigRole = await (healthIDNFT as any).hasRole(MULTISIG_ROLE, deployer.address);
    
    console.log("✅ Deployment verification:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Total Supply:", totalSupply.toString());
    console.log("- Next Token ID:", currentTokenId.toString());
    console.log("- Admin Role:", hasAdminRole ? "✅" : "❌");
    console.log("- Minter Role:", hasMinterRole ? "✅" : "❌");
    console.log("- Multisig Role:", hasMultisigRole ? "✅" : "❌");
    
    // Test minting functionality
    console.log("\n🧪 Testing mint functionality...");
    try {
      const mintTx = await (healthIDNFT as any).mint(deployer.address);
      await mintTx.wait();
      
      const newTotalSupply = await (healthIDNFT as any).totalSupply();
      const ownerOfToken1 = await (healthIDNFT as any).ownerOf(1);
      
      console.log("✅ Test mint successful:");
      console.log("- New Total Supply:", newTotalSupply.toString());
      console.log("- Token #1 Owner:", ownerOfToken1);
      console.log("- Owner matches deployer:", ownerOfToken1 === deployer.address ? "✅" : "❌");
      
    } catch (error) {
      console.log("❌ Test mint failed:", error);
    }
    
    // Get deployment transaction
    const deploymentTx = healthIDNFT.deploymentTransaction();
    
    // Save deployment info
    const deploymentInfo = {
      network: "alfajores",
      chainId: 44787,
      contractName: "HealthIDNFT",
      contractAddress: contractAddress,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      transactionHash: deploymentTx?.hash || "N/A",
      blockNumber: deploymentTx?.blockNumber || "N/A",
      gasUsed: deploymentTx?.gasLimit?.toString() || "N/A",
      contractDetails: {
        name: name,
        symbol: symbol,
        type: "Soulbound NFT",
        totalSupply: totalSupply.toString(),
        nextTokenId: currentTokenId.toString(),
        admin: deployer.address,
        features: [
          "Soulbound (Non-transferable)",
          "Role-based Access Control",
          "Metadata URI Support",
          "Auto-incrementing Token IDs",
          "Admin-controlled Minting"
        ]
      }
    };
    
    console.log("\n📄 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2));
    
    console.log("\n🌍 View on Celoscan:");
    console.log(`https://alfajores.celoscan.io/address/${contractAddress}`);
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("💡 Next steps:");
    console.log("1. Verify the contract on Celoscan");
    console.log("2. Test minting with metadata");
    console.log("3. Test soulbound restrictions");
    console.log("4. Set up additional minters if needed");
    
    console.log("\n🔐 Important Notes:");
    console.log("- This is a SOULBOUND NFT - tokens cannot be transferred");
    console.log("- Only addresses with MINTER_ROLE can mint tokens");
    console.log("- Admin can update metadata and grant/revoke roles");
    console.log("- Token IDs auto-increment starting from 1");
    
    return {
      address: contractAddress,
      deployer: deployer.address,
      name: name,
      symbol: symbol
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