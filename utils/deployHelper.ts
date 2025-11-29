import fs from "fs";
import path from "path";

export interface DeployedAddresses {
  network: string;
  lastUpdated: string;
  deployer: string;
  contracts: {
    FlameBornToken?: ContractInfo;
    FlameBornHealthIDNFT?: ContractInfo;
    FlameBornEngine?: ContractInfo;
    GrantManager?: ContractInfo;
  };
}

export interface ContractInfo {
  address: string;
  deploymentTx?: string;
  deployedAt: string;
  verified?: boolean;
  implementationAddress?: string; // For upgradeable contracts
}

export class DeployHelper {
  private filePath: string;
  private data!: DeployedAddresses;

  constructor(networkName: string = "unknown") {
    this.filePath = path.join(__dirname, "..", "deployments", "addresses.json");

    // Ensure deployments directory exists
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.loadData(networkName);
  }

  private loadData(networkName: string) {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, "utf8");
        this.data = JSON.parse(fileContent);

        // Update network if different
        if (this.data.network !== networkName) {
          this.data.network = networkName;
          this.saveData();
        }
      } else {
        // Initialize new data structure
        this.data = {
          network: networkName,
          lastUpdated: new Date().toISOString(),
          deployer: "",
          contracts: {}
        };

        // Pre-populate with canonical addresses for alfajores network
        if (networkName === "alfajores") {
          this.data.contracts = {
            FlameBornToken: {
              address: "0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1",
              deployedAt: "2025-09-29T00:00:00.000Z",
              implementationAddress: "0x1C6924E0a6Ae373A9b52cbFF66075A72c1B97502",
              verified: true
            },
            FlameBornHealthIDNFT: {
              address: "0x1566c75a1Bad93a9fa5E2Da690395987E36e08e8",
              deployedAt: "2025-09-29T00:00:00.000Z",
              verified: true
            },
            FlameBornEngine: {
              address: "0x82cA6C5FE9d7E834D908a2482aB76A51D64f5BB4",
              deployedAt: "2025-09-29T00:00:00.000Z",
              implementationAddress: "0xE8CEb669437E93208D605dE18433E46297F21cb1",
              verified: true
            }
          };
        }

        this.saveData();
      }
    } catch (error) {
      console.error("Error loading deployment data:", error);
      // Initialize with defaults
      this.data = {
        network: networkName,
        lastUpdated: new Date().toISOString(),
        deployer: "",
        contracts: {}
      };
    }
  }

  private saveData() {
    this.data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  setDeployer(deployerAddress: string) {
    this.data.deployer = deployerAddress;
    this.saveData();
  }

  isDeployed(contractName: keyof DeployedAddresses["contracts"]): boolean {
    return !!this.data.contracts[contractName]?.address;
  }

  getAddress(contractName: keyof DeployedAddresses["contracts"]): string | null {
    return this.data.contracts[contractName]?.address || null;
  }

  saveDeployment(
    contractName: keyof DeployedAddresses["contracts"],
    address: string,
    deploymentTx?: string,
    implementationAddress?: string
  ) {
    this.data.contracts[contractName] = {
      address,
      deploymentTx,
      deployedAt: new Date().toISOString(),
      implementationAddress
    };
    this.saveData();
    console.log(`✅ Saved ${contractName} deployment: ${address}`);
  }

  markVerified(contractName: keyof DeployedAddresses["contracts"]) {
    if (this.data.contracts[contractName]) {
      this.data.contracts[contractName].verified = true;
      this.saveData();
      console.log(`✅ Marked ${contractName} as verified`);
    }
  }

  getAllAddresses(): DeployedAddresses["contracts"] {
    return this.data.contracts;
  }

  getDeploymentInfo(): DeployedAddresses {
    return { ...this.data };
  }

  // Utility method to check if all required contracts are deployed
  hasAllContracts(): boolean {
    const required = ["FlameBornToken", "FlameBornHealthIDNFT", "FlameBornEngine", "GrantManager"];
    return required.every(name =>
      this.isDeployed(name as keyof DeployedAddresses["contracts"])
    );
  }

  // Get deployment summary
  getSummary(): string {
    const summary = [
      `📊 Deployment Summary (${this.data.network})`,
      `👤 Deployer: ${this.data.deployer}`,
      `🕒 Last Updated: ${this.data.lastUpdated}`,
      "",
      "📋 Contracts:"
    ];

    Object.entries(this.data.contracts).forEach(([name, info]) => {
      const status = info.verified ? "✅ Verified" : "📝 Deployed";
      summary.push(`  ${name}: ${info.address} (${status})`);
    });

    return summary.join("\n");
  }
}

// Factory function for easy usage
export function createDeployHelper(networkName: string): DeployHelper {
  return new DeployHelper(networkName);
}
