const fs = require("fs");

const outDir = "docs/provenance";
fs.mkdirSync(outDir, { recursive: true });

const snapshot = {
  at: new Date().toISOString(),
  notes: "Automated tag snapshot",
  events: []
};

const fileName = `${outDir}/snapshot-${Date.now()}.json`;
fs.writeFileSync(fileName, JSON.stringify(snapshot, null, 2));
console.log(`Provenance snapshot written: ${fileName}`);
