const { newKit } = require('@celo/contractkit');

function getKit() {
  const rpc = process.env.CELO_SEPOLIA_RPC_URL || 'https://forno.celo.org/sepolia';
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error('Missing PRIVATE_KEY in env');

  const kit = newKit(rpc);
  kit.connection.addAccount(pk);
  const acct = kit.web3.eth.accounts.privateKeyToAccount(pk).address;
  return { kit, acct };
}

async function getErc20(kit, addr) {
  if (!addr) throw new Error('Missing token address');
  const erc20 = await kit.contracts.getErc20(addr);
  return erc20;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { getKit, getErc20, sleep };
