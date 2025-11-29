const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

const SRC = path.resolve('recipients.json');
const OUT = path.resolve('recipients.cleaned.json');
const REPORT = path.resolve('recipients.repair-report.json');
const ONE_FLB = '1000000000000000000';
const web3 = new Web3();

function isHex40(value) {
  return /^0x[0-9a-fA-F]{40}$/.test(value || '');
}

function main() {
  const rows = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  const seen = new Set();
  const kept = [];
  const report = { invalid: [], duplicates: [] };

  rows.forEach((entry, index) => {
    const address = entry && entry.address;
    if (!isHex40(address)) {
      report.invalid.push({ row: index, address });
      return;
    }

    const checksum = web3.utils.toChecksumAddress(address);
    const key = checksum.toLowerCase();
    if (seen.has(key)) {
      report.duplicates.push({ row: index, address: checksum });
      return;
    }

    seen.add(key);
    kept.push({ address: checksum, amount: String(entry.amount ?? ONE_FLB) });
  });

  fs.writeFileSync(OUT, JSON.stringify(kept, null, 2));
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));

  console.log('🧹 Repair complete.');
  console.log(`   kept: ${kept.length}`);
  console.log(`   invalid: ${report.invalid.length}`);
  console.log(`   duplicates: ${report.duplicates.length}`);
  console.log('➡️  Wrote recipients.cleaned.json and recipients.repair-report.json.');
  console.log('NOTE: If kept < 200, supply replacement addresses before proceeding.');
}

try {
  main();
  process.exit(0);
} catch (err) {
  console.error('❌ Repair script failed:', err.message || err);
  process.exit(1);
}
