const { getKit, getErc20 } = require('./_kit');

(async () => {
  try {
    const { kit } = getKit();
    const tokenAddr = process.env.FLB_TOKEN_ADDRESS;
    if (!tokenAddr) throw new Error('Set FLB_TOKEN_ADDRESS');

    const target = process.argv[2] || process.env.CHECK_ADDR;
    if (!target) {
      throw new Error('Provide address as argv[2] or set CHECK_ADDR in env');
    }

    const token = await getErc20(kit, tokenAddr);
    const bal = await token.balanceOf(target);
    console.log(`💰 FLB balance of ${target}: ${bal}`);
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message || e);
    process.exit(1);
  }
})();
