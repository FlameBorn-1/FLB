// scripts/deploy-donation-router.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying FlameBorn DonationRouter with account:", deployer.address);

  // Configuration - update placeholders before deploying to production
  const config = {
    cUSD: "0x2e75287c542b9b111906d961d58f2617059dde3c", // Celo Alfajores cUSD
    beneficiaryWallet: "0x7e7c8e5f305b39133608af5f01985d9958d62864", // Placeholder until beneficiary multisig is ready
    coreTeamWallet: "0x7d60ba97ef6293cd0d8fc68d4191e331bd0e1f1d", // Core team multisig
    guardianWallet: "0x7e7c8e5f305b39133608af5f01985d9958d62864", // Placeholder until guardian rewards wallet exists
    growthWallet: "0x169a151503a5954aee7cb325c04e4179873e9a0f", // Growth and outreach multisig
    infrastructureWallet: "0x9fe2f042b1fb7c03d84480a0a14fe8340b428191", // Infrastructure and innovation fund
    daoGovernance: "0x7e7c8e5f305b39133608af5f01985d9958d62864", // DAO governance contract or multisig
  };

  console.log("Deployment Configuration:");
  console.log("- cUSD:", config.cUSD);
  console.log("- Beneficiary Wallet (placeholder):", config.beneficiaryWallet);
  console.log("- Core Team Wallet:", config.coreTeamWallet);
  console.log("- Guardian Wallet (placeholder):", config.guardianWallet);
  console.log("- Growth Wallet:", config.growthWallet);
  console.log("- Infrastructure Wallet:", config.infrastructureWallet);
  console.log("- DAO Governance:", config.daoGovernance);

  const DonationRouter = await ethers.getContractFactory("FlameBornDonationRouter");
  const donationRouter = await DonationRouter.deploy(
    config.cUSD,
    config.beneficiaryWallet,
    config.coreTeamWallet,
    config.guardianWallet,
    config.growthWallet,
    config.infrastructureWallet,
    config.daoGovernance
  );

  await donationRouter.deployed();

  console.log("\nFlameBorn DonationRouter deployed to:", donationRouter.address);
  console.log("Initial allocation: 75% Beneficiaries, 10% Core Team, 5% Guardian, 5% Growth, 5% Infrastructure");

  // Verify covenant constants
  const minBeneficiary = await donationRouter.MIN_BENEFICIARY_SHARE();
  console.log("Covenant enforced: minimum", minBeneficiary.toString() + "% routed to beneficiaries");

  // Verify the allocation from contract storage
  const currentAllocation = await donationRouter.getAllocation();
  console.log("\nVerified Allocation:");
  console.log("- Beneficiaries:", currentAllocation.beneficiary.toString() + "%");
  console.log("- Core Team:", currentAllocation.coreTeam.toString() + "%");
  console.log("- Guardian Rewards:", currentAllocation.guardianRewards.toString() + "%");
  console.log("- Growth:", currentAllocation.growth.toString() + "%");
  console.log("- Infrastructure:", currentAllocation.infrastructure.toString() + "%");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
