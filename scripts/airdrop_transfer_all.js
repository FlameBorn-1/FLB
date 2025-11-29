const fs = require('fs');
const path = require('path');
const { getKit, getErc20, sleep } = require('./_kit');

const ONE_FLB = '1000000000000000000';
const FLB = process.env.FLB_TOKEN_ADDRESS;

(async () => {
  try {
    const { kit, acct } = getKit();
    const token = await getErc20(kit, FLB);

    const recipients = JSON.parse(fs.readFileSync(path.resolve('recipients.json'), 'utf8'));

    const bal = await token.balanceOf(acct);
    const required = (BigInt(ONE_FLB) * BigInt(recipients.length)).toString();
    if (BigInt(bal.toString()) < BigInt(required)) {
      throw new Error(`Insufficient FLB balance. Need ${required}, have ${bal}`);
    }

    console.log(`🔐 Sender: ${acct}`);
    console.log(`🏷️ Token: ${FLB}`);
    console.log(`📦 Transfers: ${recipients.length} × 1 FLB`);

    let i = 0;
    for (const r of recipients) {
      i += 1;
      const amount = String(r.amount ?? ONE_FLB);
      console.log(`➡️  [${i}/${recipients.length}] Sending 1 FLB to ${r.address} ...`);
      const tx = await token.transfer(r.address, amount).send({ from: acct });
      const receipt = await tx.waitReceipt();
      console.log(`   ✅ tx: ${receipt.transactionHash}`);
      await sleep(250);
    }

    console.log('🎉 ✅ Airdrop completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  }
})();
