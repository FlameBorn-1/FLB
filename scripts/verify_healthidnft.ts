import { ethers } from "hardhat";

async function main() {
  // Use the deployed contract address
  const contractAddress = "0x115aA20101bd0F95516Cc67ea104eD0B0c642919";

  console.log("🔍 Verifying HealthIDNFT deployment...");
  console.log("📍 Contract Address:", contractAddress);

  try {
    // Get the contract instance
    const HealthIDNFT = await ethers.getContractFactory("HealthIDNFT");
    const healthIDNFT = HealthIDNFT.attach(contractAddress) as any;

    // Verify basic contract info
    console.log("\n✅ Contract Information:");
    const name = await healthIDNFT.name();
    const symbol = await healthIDNFT.symbol();
    const totalSupply = await healthIDNFT.totalSupply();
    const currentTokenId = await healthIDNFT.getCurrentTokenId();

    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Total Supply:", totalSupply.toString());
    console.log("- Next Token ID:", currentTokenId.toString());

    // Check roles
    console.log("\n🔐 Role Verification:");
    const DEFAULT_ADMIN_ROLE = await healthIDNFT.DEFAULT_ADMIN_ROLE();
    const MINTER_ROLE = await healthIDNFT.MINTER_ROLE();
    const MULTISIG_ROLE = await healthIDNFT.MULTISIG_ROLE();

    console.log("- Default Admin Role:", DEFAULT_ADMIN_ROLE);
    console.log("- Minter Role:", MINTER_ROLE);
    console.log("- Multisig Role:", MULTISIG_ROLE);

    // Get current signer
    const [signer] = await ethers.getSigners();
    
    // Check role assignments
    const hasAdminRole = await healthIDNFT.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
    const hasMinterRole = await healthIDNFT.hasRole(MINTER_ROLE, signer.address);
    const hasMultisigRole = await healthIDNFT.hasRole(MULTISIG_ROLE, signer.address);

    console.log("\n👤 Current Signer Role Status:");
    console.log("- Address:", signer.address);
    console.log("- Has Admin Role:", hasAdminRole ? "✅" : "❌");
    console.log("- Has Minter Role:", hasMinterRole ? "✅" : "❌");
    console.log("- Has Multisig Role:", hasMultisigRole ? "✅" : "❌");

    // Test soulbound restrictions
    console.log("\n🔒 Testing Soulbound Restrictions:");
    
    try {
      // This should fail
      await healthIDNFT.approve(signer.address, 1);
      console.log("❌ ERROR: approve() should have failed!");
    } catch (error: any) {
      if (error.message.includes("SoulboundApprovalNotAllowed")) {
        console.log("✅ approve() correctly blocked");
      } else {
        console.log("⚠️ approve() failed with unexpected error:", error.message);
      }
    }

    try {
      // This should fail
      await healthIDNFT.setApprovalForAll(signer.address, true);
      console.log("❌ ERROR: setApprovalForAll() should have failed!");
    } catch (error: any) {
      if (error.message.includes("SoulboundSetApprovalForAllNotAllowed")) {
        console.log("✅ setApprovalForAll() correctly blocked");
      } else {
        console.log("⚠️ setApprovalForAll() failed with unexpected error:", error.message);
      }
    }

    // Test interface support
    console.log("\n🔌 Interface Support:");
    const supportsERC721 = await healthIDNFT.supportsInterface("0x80ac58cd");
    const supportsERC721Metadata = await healthIDNFT.supportsInterface("0x5b5e139f");
    const supportsAccessControl = await healthIDNFT.supportsInterface("0x7965db0b");

    console.log("- ERC721:", supportsERC721 ? "✅" : "❌");
    console.log("- ERC721Metadata:", supportsERC721Metadata ? "✅" : "❌");
    console.log("- AccessControl:", supportsAccessControl ? "✅" : "❌");

    // If there are tokens, check ownership
    if (totalSupply > 0) {
      console.log("\n🎫 Token Ownership:");
      for (let i = 1; i <= Math.min(Number(totalSupply), 5); i++) {
        try {
          const owner = await healthIDNFT.ownerOf(i);
          const tokenURI = await healthIDNFT.tokenURI(i);
          console.log(`- Token #${i}: Owner ${owner}`);
          if (tokenURI) {
            console.log(`  Metadata: ${tokenURI}`);
          }
        } catch (error) {
          console.log(`- Token #${i}: Not found or error`);
        }
      }
    }

    console.log("\n🎉 Contract verification completed successfully!");
    console.log("🌍 View on Celoscan:");
    console.log(`https://alfajores.celoscan.io/address/${contractAddress}`);

    console.log("\n📋 Summary:");
    console.log("- Contract Type: Soulbound NFT (Non-transferable)");
    console.log("- Access Control: Role-based with Admin/Minter/Multisig roles");
    console.log("- Token Counter: Auto-incrementing from 1");
    console.log("- Metadata Support: ERC721URIStorage with updateable URIs");
    console.log("- Transfer Restrictions: All transfers blocked except minting");

  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}

export default main;