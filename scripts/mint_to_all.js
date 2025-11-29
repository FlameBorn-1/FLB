const fs = require('fs');
const path = require('path');
const { getKit, sleep } = require('./_kit');

const MINT_FN = process.env.MINT_FUNCTION || 'mint';
const ONE_FLB = '1000000000000000000';

const buildMintAbi = (fn) => [
  {
    type: 'function',
    name: fn,
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: []
  }
];

(async () => {
  try {
    const { kit, acct } = getKit();
    const mintAddr = process.env.MINT_CONTRACT_ADDRESS || process.env.FLB_TOKEN_ADDRESS;
    if (!mintAddr) throw new Error('Set MINT_CONTRACT_ADDRESS or FLB_TOKEN_ADDRESS');

    const recipients = JSON.parse(fs.readFileSync(path.resolve('recipients.json'), 'utf8'));
    const abi = buildMintAbi(MINT_FN);
    const contract = new kit.web3.eth.Contract(abi, mintAddr);

    console.log(`🔐 Minter: ${acct}`);
    console.log(`🏭 Mint contract: ${mintAddr} (fn: ${MINT_FN})`);
    console.log(`📦 Minting ${recipients.length} × 1 FLB`);

    let i = 0;
    for (const r of recipients) {
      i += 1;
      const amount = String(r.amount ?? ONE_FLB);
      console.log(`➕ [${i}/${recipients.length}] Minting 1 FLB to ${r.address} ...`);
      const tx = await contract.methods[MINT_FN](r.address, amount).send({ from: acct });
      console.log(`   ✅ tx: ${tx.transactionHash}`);
      await sleep(250);
    }

    console.log('🎉 ✅ Mint-to-all completed.');
    process.exit(0);
  } catch (e) {
    console.error('❌ Mint-to-all failed:', e.message || e);
    process.exit(1);
  }
})();
