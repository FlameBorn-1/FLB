const { ethers } = require('hardhat');
require('dotenv').config();

const FLAME_BORN_ENGINE = '0x7aD2EB9BcdAd361f51574B32a794c6fD7fE0e0a6';

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.ALFAJORES_RPC_URL);
  const contract = new ethers.Contract(
    FLAME_BORN_ENGINE,
    [
      'event DonationReceived(address indexed donor, uint256 amount)',
      'event ActorVerified(address indexed actor)',
      'event DonationsWithdrawn(address indexed recipient, uint256 amount)'
    ],
    provider
  );

  // Set up event listeners
  contract.on('DonationReceived', (donor, amount) => {
    console.log(`💰 Donation: ${ethers.formatEther(amount)} CELO from ${donor}`);
  });

  contract.on('ActorVerified', (actor) => {
    console.log(`✅ Actor verified: ${actor}`);
  });

  console.log('👀 Monitoring FlameBornEngine events...');
}

main().catch(console.error);
