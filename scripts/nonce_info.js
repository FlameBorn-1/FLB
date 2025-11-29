require('dotenv').config();
const { ethers } = require('ethers');

(async () => {
  const rpc = process.env.ALFAJORES_RPC_URL || 'https://alfajores-forno.celo-testnet.org';
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error('Missing PRIVATE_KEY');

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);

  const latest = await provider.getTransactionCount(wallet.address, 'latest');
  const pending = await provider.getTransactionCount(wallet.address, 'pending');

  console.log('Address :', wallet.address);
  console.log('Latest  :', latest);
  console.log('Pending :', pending);
})();
