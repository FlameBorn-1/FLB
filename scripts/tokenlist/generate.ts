import fs from "fs";

const manifestPath = "deployments/alfajores.json";
if (!fs.existsSync(manifestPath)) {
  throw new Error(`Missing deployment manifest at ${manifestPath}`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const tokenAddress =
  manifest.FlameBornToken?.proxy || manifest.FlameBornToken?.address || manifest.FLB;

if (!tokenAddress) {
  throw new Error("FlameBornToken address not found in manifest");
}

const tokenlist = {
  name: "FlameBorn (Alfajores)",
  logoURI: "https://example.com/flameborn-logo.png",
  keywords: ["flameborn", "health", "impact"],
  timestamp: new Date().toISOString(),
  version: { major: 1, minor: 0, patch: 0 },
  tags: {
    impact: { name: "Impact", description: "Proof-of-Impact token" }
  },
  tokens: [
    {
      chainId: 44787,
      address: tokenAddress,
      name: "FlameBorn",
      symbol: "FLB",
      decimals: 18,
      logoURI: "https://example.com/flb.png",
      tags: ["impact"]
    }
  ]
};

fs.mkdirSync("tokenlists", { recursive: true });
fs.writeFileSync("tokenlists/flameborn.tokenlist.json", JSON.stringify(tokenlist, null, 2));
console.log("Wrote tokenlists/flameborn.tokenlist.json");
