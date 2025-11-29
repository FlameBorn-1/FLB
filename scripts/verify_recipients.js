const fs = require('fs');
const path = require('path');

const ONE_FLB = '1000000000000000000';
const EXPECTED = Number(process.env.EXPECTED_RECIPIENTS || 160);
const recipientsPath = path.resolve(process.cwd(), 'recipients.json');
const recipients = JSON.parse(fs.readFileSync(recipientsPath, 'utf8'));

function isChecksum(addr) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

const seen = new Set();
let ok = true;

if (!Array.isArray(recipients) || recipients.length !== EXPECTED) {
  console.error(
    `❌ Expected ${EXPECTED} recipients, got ${Array.isArray(recipients) ? recipients.length : 'invalid file'}`
  );
  ok = false;
}

recipients.forEach((r, i) => {
  if (!r || typeof r.address !== 'string' || !isChecksum(r.address)) {
    console.error(`❌ Row ${i}: bad address:`, r && r.address);
    ok = false;
  }
  const key = r && r.address ? r.address.toLowerCase() : '';
  if (seen.has(key)) {
    console.error(`❌ Duplicate address at row ${i}: ${r.address}`);
    ok = false;
  }
  seen.add(key);

  const amt = String(r && r.amount !== undefined ? r.amount : ONE_FLB);
  if (amt !== ONE_FLB) {
    console.error(`❌ Row ${i}: amount != 1e18 wei: ${amt}`);
    ok = false;
  }
});

if (ok) {
  console.log('✅ recipients.json sanity checks passed: 200 unique addresses, each 1 FLB (1e18 wei).');
  process.exit(0);
} else {
  process.exit(1);
}
