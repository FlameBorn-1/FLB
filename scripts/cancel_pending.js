require('dotenv').config();
const { ethers } = require('ethers');
const { buildFees, nextNonce } = require('./_fees');

(async () => {
  const rpc = process.env.ALFAJORES_RPC_URL || 'https://alfajores-forno.celo-testnet.org';
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error('Missing PRIVATE_KEY');

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);

  const nonce = await nextNonce(provider, wallet.address);
  const fee = await buildFees(provider);

  console.log('🔐', wallet.address, 'nonce(pending)=', nonce, 'fee=', fee);

  const tx = await wallet.sendTransaction({ to: wallet.address, value: 0, nonce, ...fee });
  console.log('⛽ cancel tx:', tx.hash);

  const receipt = await tx.wait();
  console.log('✅ cancel mined in block', receipt.blockNumber);
})();
