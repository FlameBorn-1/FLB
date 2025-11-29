import { config as dotenv } from "dotenv";
dotenv();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

const RAW_PK = process.env.CELO_DEPLOYER_PK || process.env.PRIVATE_KEY;
const IS_VALID_PK = RAW_PK && /^0x[0-9a-fA-F]{64}$/.test(RAW_PK);
const accounts = IS_VALID_PK ? [RAW_PK] : [];
const CELO_SEPOLIA_RPC_URL =
  process.env.CELO_SEPOLIA_RPC_URL || "https://celo-sepolia.blockscout.com/api/eth-rpc";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      chainId: 44787,
      accounts
    },
    celo: {
      url: "https://forno.celo.org",
      chainId: 42220,
      accounts
    },
    celoSepolia: {
      url: CELO_SEPOLIA_RPC_URL,
      chainId: 11142220,
      accounts
    }
  },
  etherscan: {
    apiKey: {
      alfajores: process.env.CELOSCAN_API_KEY || "",
      celo: process.env.CELOSCAN_API_KEY || "",
      celoSepolia: process.env.CELOSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io"
        }
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io"
        }
      },
      {
        network: "celoSepolia",
        chainId: 11142220,
        urls: {
          apiURL: "https://celo-sepolia.blockscout.com/api",
          browserURL: "https://celo-sepolia.blockscout.com"
        }
      }
    ]
  }
};

export default config;
