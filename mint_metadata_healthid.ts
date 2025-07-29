import { ethers } from "ethers";

async function main() {
  const [contractAddress, recipientAddress, metadataURI] = process.argv.slice(2);

  if (!contractAddress || !recipientAddress || !metadataURI) {
    console.error("Usage: npx hardhat run scripts/mint_metadata_healthid.ts <contractAddress> <recipientAddress> <metadataURI>");
    process.exit(1);
  }

  if (!ethers.isAddress(contractAddress) || !ethers.isAddress(recipientAddress)) {
      console.error("❌ Invalid address provided for contract or recipient.");
      process.exit(1);
  }

  console.log("🚀 Starting HealthIDNFT minting process...");
  console.log("   - Contract Address:", contractAddress);
  console.log("   - Recipient Address:", recipientAddress);
  console.log("   - Metadata URI:", metadataURI);

  const [minter] = await (ethers as any).getSigners();
  console.log("   - Using Minter Account:", minter.address);

  try {
    const HealthIDNFT = await (ethers as any).getContractFactory("HealthIDNFT");
    const healthIDNFT = HealthIDNFT.attach(contractAddress) as any;

    // Check if the signer has the MINTER_ROLE
    const MINTER_ROLE = await healthIDNFT.MINTER_ROLE();

  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
}