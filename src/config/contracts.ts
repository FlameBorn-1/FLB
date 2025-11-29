// FlameBorn Contract Configuration - Celo Sepolia
export const NETWORK_CONFIG = {
  chainId: 11142220,
  name: "Celo Sepolia",
  rpcUrl: "https://celo-sepolia-rpc.publicnode.com",
  explorerUrl: "https://sepolia.celoscan.io",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18
  }
};

export const CONTRACT_ADDRESSES = {
  FLB_TOKEN: "0xb48Cc842C41d694260726FacACad556ef3483fEC",
  HEALTHID_NFT: "0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6",
  ENGINE: "0xE9Fcf860635E7B7C0a372e9aC790391168B56327",
  GRANT_MANAGER: "0x8A976c9424e1482F6Ac51C6c5f0162357C6519c2",
  CUSD: "0x4822e58de6f5e485eF90df51C41CE01721331dC0"
};

export const TOKEN_INFO = {
  FLB: {
    name: "FlameBorn Token",
    symbol: "FLB",
    decimals: 18,
    address: CONTRACT_ADDRESSES.FLB_TOKEN
  },
  CUSD: {
    name: "Celo Dollar",
    symbol: "cUSD",
    decimals: 18,
    address: CONTRACT_ADDRESSES.CUSD
  }
};

export default {
  network: NETWORK_CONFIG,
  contracts: CONTRACT_ADDRESSES,
  tokens: TOKEN_INFO
};
