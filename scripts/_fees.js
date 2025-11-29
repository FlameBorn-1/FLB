const { ethers } = require('ethers');

function gwei(x){ return ethers.parseUnits(String(x), 'gwei'); }

async function buildFees(provider){
  const [fd, latestBlock] = await Promise.all([
    provider.getFeeData(),
    provider.getBlock('latest')
  ]);

  const envMaxP = process.env.GAS_MAX_PRIORITY_GWEI;
  const envMaxF = process.env.GAS_MAX_FEE_GWEI;

  const baseFee = latestBlock?.baseFeePerGas ?? fd.lastBaseFeePerGas ?? null;

  const defaultPriority = fd.maxPriorityFeePerGas ?? gwei(3);
  let maxPriority = envMaxP ? gwei(envMaxP) : (defaultPriority * 130n) / 100n;

  if (envMaxF) {
    const maxFee = gwei(envMaxF);
    // Respect the override but still ensure it clears the base fee floor.
    if (baseFee && maxFee <= baseFee) {
      const baseFeeGwei = ethers.formatUnits(baseFee, 'gwei');
      throw new Error(`GAS_MAX_FEE_GWEI=${envMaxF} below base fee (~${baseFeeGwei} gwei)`);
    }
    return { maxFeePerGas: maxFee, maxPriorityFeePerGas: maxPriority };
  }

  if (fd.maxFeePerGas) {
    let maxFee = (fd.maxFeePerGas * 130n) / 100n;
    if (baseFee && maxFee < baseFee + maxPriority) {
      maxFee = baseFee + maxPriority;
    }
    return { maxFeePerGas: maxFee, maxPriorityFeePerGas: maxPriority };
  }

  if (baseFee) {
    // EIP-1559 style block but provider fee data missing maxFeePerGas.
    const maxFee = baseFee + maxPriority;
    return { maxFeePerGas: maxFee, maxPriorityFeePerGas: maxPriority };
  }

  let gasPrice = fd.gasPrice ?? gwei(3);
  gasPrice = (gasPrice * 130n) / 100n;
  return { gasPrice };
}

async function nextNonce(provider, addr){
  return provider.getTransactionCount(addr, 'pending');
}

module.exports = { buildFees, nextNonce };
