require('dotenv').config();
const { ethers } = require('ethers');
const { buildFees, nextNonce } = require('./_fees');

const RPC   = process.env.ALFAJORES_RPC_URL || 'https://alfajores-forno.celo-testnet.org';
const PK    = process.env.PRIVATE_KEY;
const TOKEN = process.env.FLB_TOKEN_ADDRESS;
const ENGINE= process.env.ENGINE_ADDRESS;
const TOTAL = BigInt(process.env.MINT_TOTAL_FLB || '200');
const ONE   = BigInt('1000000000000000000');

function need(name, value) {
  if (!value) throw new Error(`Missing ${name} in .env`);
}

const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  }
];

const VARIANTS = [
  { name: 'mint', inputs: ['address', 'uint256'] },
  { name: 'mintTo', inputs: ['address', 'uint256'] }
];

function abiFor(name, inputs) {
  return [
    {
      type: 'function',
      name,
      stateMutability: 'nonpayable',
      inputs: inputs.map((t) => ({ type: t })),
      outputs: []
    }
  ];
}

(async () => {
  need('PRIVATE_KEY', PK);
  need('FLB_TOKEN_ADDRESS', TOKEN);
  need('ENGINE_ADDRESS', ENGINE);

  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(PK, provider);

  console.log('🔐 Operator:', wallet.address);
  console.log('🏷️ Token   :', TOKEN);
  console.log('🏭 Engine  :', ENGINE);
  console.log('➕ Total   :', TOTAL.toString(), 'FLB');

  const [codeToken, codeEngine] = await Promise.all([
    provider.getCode(TOKEN),
    provider.getCode(ENGINE)
  ]);
  if (codeToken === '0x') throw new Error(`No contract at TOKEN ${TOKEN}`);
  if (codeEngine === '0x') throw new Error(`No contract at ENGINE ${ENGINE}`);

  const wei = (ONE * TOTAL).toString();
  let call;
  let desc;

  for (const variant of VARIANTS) {
    const contract = new ethers.Contract(TOKEN, abiFor(variant.name, variant.inputs), wallet);
    try {
      await contract[variant.name].staticCall(ENGINE, wei);
      call = (overrides) => contract[variant.name](ENGINE, wei, overrides);
      desc = `${variant.name}(address,uint256)`;
      break;
    } catch (_) {
      // try next variant
    }
  }

  if (!call) {
    throw new Error('Token did not accept mint(address,uint256) nor mintTo(address,uint256). Provide exact token ABI.');
  }

  const fee = await buildFees(provider);
  const nonce = await nextNonce(provider, wallet.address);

  console.log('✅ Using signature:', desc, '->', ENGINE, wei);
  console.log('⛽ fees=', fee, 'nonce=', nonce);

  const tx = await call({ ...fee, nonce });
  console.log('⛽ tx:', tx.hash);

  const receipt = await tx.wait();
  console.log('✅ Mint mined in block', receipt.blockNumber);

  const tokenReadOnly = new ethers.Contract(TOKEN, ERC20_ABI, wallet);
  const balance = await tokenReadOnly.balanceOf(ENGINE);
  console.log('💰 Engine FLB balance (wei):', balance.toString());
})().catch((error) => {
  console.error('❌ Mint failed:', error);
  process.exit(1);
});
