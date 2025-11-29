# FlameBorn Contract Deployments

For detailed runbooks see `docs/DEPLOYMENTS.md`. This summary tracks active networks and the canonical addresses committed in `deployments/*.json`.

## Celo Sepolia Testnet (Active)

- **Chain ID:** `11142220`
- **RPC:** `https://celo-sepolia.blockscout.com/api/eth-rpc`
- **Explorer:** `https://celo-sepolia.blockscout.com`

| Contract | Address |
| --- | --- |
| FLB Token (proxy) | `0xb48Cc842C41d694260726FacACad556ef3483fEC` |
| FLB Token (implementation) | `0x93F4c3B97aa4706e0a84f7667eB7f356F138dC60` |
| FlameBorn HealthID NFT | `0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6` |
| FlameBorn Engine (proxy) | `0xE9Fcf860635E7B7C0a372e9aC790391168B56327` |
| FlameBorn Engine (implementation) | `0xb8f4795f1aE3d8f51859d9b1E13d07399db2A5C8` |
| Grant Manager | `0x8A976c9424e1482F6Ac51C6c5f0162357C6519c2` |
| cUSD (stablecoin) | `0x4822e58de6f5e485eF90df51C41CE01721331dC0` |

**Verification:** Implementations and proxies verified on Blockscout.

**Roles:**

- Token `MINTER_ROLE` → `0xE9Fcf860635E7B7C0a372e9aC790391168B56327`
- Token & NFT `DEFAULT_ADMIN_ROLE` → `0x2E75287C542B9b111906D961d58f2617059dDe3c`

## Historical Networks

- **Alfajores (44787):** Legacy deployment kept for reference in `deployments/alfajores.json`.
- **Celo Mainnet (42220):** _Not deployed yet_. This document will be updated post-mainnet launch.

**Canonical sources:**

- Sepolia → `deployments/celoSepolia.json`
- Alfajores → `deployments/alfajores.json`

**Last Updated:** 2025-11-29
