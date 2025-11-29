const { getKit } = require('./_kit');

const MINT_ABI = [
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: []
  }
];

const ONE_FLB = BigInt('1000000000000000000');

(async () => {
  try {
    const { kit, acct } = getKit();
    const mintAddr = process.env.MINT_CONTRACT_ADDRESS || process.env.FLB_TOKEN_ADDRESS;
    if (!mintAddr) throw new Error('Set MINT_CONTRACT_ADDRESS or FLB_TOKEN_ADDRESS');

    const total = BigInt(process.env.MINT_TOTAL_FLB || '200');
    const contract = new kit.web3.eth.Contract(MINT_ABI, mintAddr);
    const weiAmount = (ONE_FLB * total).toString();

    console.log(`🔐 Minter: ${acct}`);
    console.log(`🏭 Mint contract: ${mintAddr}`);
    console.log(`➕ Minting ${total} FLB (${weiAmount} wei) to distributor ${acct}`);

    const tx = await contract.methods.mint(acct, weiAmount).send({ from: acct });
    console.log('✅ Mint tx:', tx.transactionHash);
    process.exit(0);
  } catch (e) {
    console.error('❌ Mint failed:', e.message || e);
    process.exit(1);
  }
})();
