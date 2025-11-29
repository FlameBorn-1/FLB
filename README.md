# 🔥 FlameBornToken (FLB) – Celo Blockchain Project

**FlameBornToken** is an upgradeable ERC20 token deployed on the Celo blockchain, empowering digital sovereignty and decentralized innovation.

## 🌍 Live Deployments (Celo Sepolia)

### 📋 Canonical Contract Addresses

#### 🔥 FlameBornToken (FLB)

- **Proxy Address**: `0xb48Cc842C41d694260726FacACad556ef3483fEC` ✅ **CANONICAL**
- **Implementation Address**: `0x93F4c3B97aa4706e0a84f7667eB7f356F138dC60` ✅ **CANONICAL**
- **Explorer**: [View on Blockscout](https://celo-sepolia.blockscout.com/address/0xb48Cc842C41d694260726FacACad556ef3483fEC)
- **Type**: Upgradeable ERC20 with Role-Based Access Control

#### 🏥 FlameBornHealthIDNFT (FLB-HNFT)

- **Contract Address**: `0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6` ✅ **CANONICAL**
- **Explorer**: [View on Blockscout](https://celo-sepolia.blockscout.com/address/0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6)
- **Type**: Soulbound NFT with Role-Based Access Control

#### ⚙️ FlameBornEngine (FLB-EN)

- **Proxy Address**: `0xE9Fcf860635E7B7C0a372e9aC790391168B56327` ✅ **CANONICAL**
- **Implementation Address**: `0xb8f4795f1aE3d8f51859d9b1E13d07399db2A5C8` ✅ **CANONICAL**
- **Explorer**: [View on Blockscout](https://celo-sepolia.blockscout.com/address/0xE9Fcf860635E7B7C0a372e9aC790391168B56327)
- **Type**: UUPS Upgradeable Learn-to-Earn Engine

---

## ✅ Verification Status (Blockscout)

- 🟢 FLB Token (proxy + implementation) verified
- 🟢 FlameBorn Engine (proxy + implementation) verified
- 🟢 FlameBorn HealthID NFT verified

🔗 [FLB Token](https://celo-sepolia.blockscout.com/address/0xb48Cc842C41d694260726FacACad556ef3483fEC?tab=code)

🔗 [FlameBornHealthIDNFT](https://celo-sepolia.blockscout.com/address/0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6?tab=code)

🔗 [FlameBornEngine](https://celo-sepolia.blockscout.com/address/0xE9Fcf860635E7B7C0a372e9aC790391168B56327?tab=code)

## ✅ Test Coverage


The FlameBornEngine has been thoroughly tested with 5 key test cases:

1. **Actor Verification**
   - Verifies actors and mints NFT + FLB rewards
   - Validates role-based access control

2. **Donation Processing**
   - Tests CELO donations and FLB rewards
   - Verifies donor balances tracking

3. **Quest Rewards**
   - Validates FLB distribution for completed quests
   - Tests reward tracking system

4. **Withdrawals**
   - Verifies admin withdrawal functionality
   - Ensures proper fund accounting

5. **Access Control**
   - Validates role-based permissions
   - Tests custom error messages for unauthorized access

## 🧪 Running Tests

Execute the full test suite with:

```sh
npx hardhat test test/engine.test.ts
```

For gas usage reports:

```sh
npx hardhat test test/engine.test.ts --gas-report
```

---

## 🚀 Deployment & Verification

### Deploy (Celo Sepolia)

```sh
npx hardhat run scripts/deploy_engine_celo.ts --network celoSepolia
```

### Verify on Celoscan

```sh
npx hardhat verify --network celoSepolia 0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6
```

### Test Engine Functionality

- Use the frontend or scripts to interact with the contract.
- Ensure all functions (donation, rewards, actor verification, etc.) work as expected.

---

## 📊 Token Info

| Property     | Value                               |
| ------------ | ----------------------------------- |
| **Name**     | FlameBornToken                      |
| **Symbol**   | FLB                                 |
| **Decimals** | 18                                  |
| **Supply**   | Dynamic (mint-on-demand)            |
| **Standard** | Upgradeable ERC20                   |
| **Access**   | Ownable + MINTER_ROLE               |

---

## 🕊️ Covenantal Minting Principles

- **Zero-by-default**
  Every wallet begins at `0 FLB`. No pre-allocations or deployer hoards. Supply arises only when covenantal conditions are fulfilled.
- **Engine-administered issuance**
  Only designated covenantal contracts (e.g. `FlameBornEngine`) receive `MINTER_ROLE` so minting is tied to verifiable life-saving actions.
- **Non-custodial ledger**
  FLB always resides in participant wallets. The contracts orchestrate issuance and verification—never custody.
- **Transparent governance**
  Administrators can call `grantMinterRole()`/`revokeMinterRole()` on `FlameBornToken` to bless or remove covenantal issuers, keeping the mint set explicit.

---

## ✨ Key Features

### 🔥 FlameBornToken (FLB)

- ✅ ERC20-compliant & upgradeable
- 🔄 Burnable & pausable
- 🪪 EIP-2612 permit support
- 🔐 OpenZeppelin audited contracts

### 🏥 FlameBornHealthIDNFT (HID)

- 🧾 Soulbound (non-transferable)
- 🛡️ Role-based minting and access
- 📜 IPFS/URI metadata support

### ⚙️ FlameBornEngine

- ⚡ Learn-to-Earn reward distribution
- 🤝 Ties NFT and token logic together
- 🎯 Modular controller pattern (admin-controlled)
- 🧬 Donation-driven FLB mechanics

---

## 🚀 Quick Start

### 🧰 Prerequisites

- Node.js v16+
- npm or yarn
- Hardhat & Git

### 🔧 Setup

```bash
git clone https://github.com/FlameBorn-1/FLB.git
cd FLB
npm install
cp .env.example .env
# Fill .env with your private key and any custom values
```

### 🧪 Compile & Test

```bash
npx hardhat compile
npx hardhat test
```

---

## 📋 Deployment Commands

### 🚀 Orchestrated Deployment (Recommended)

Deploy all contracts in the correct order with automatic dependency management:

```bash
# Deploy all contracts (Token → NFT → Engine)
npx hardhat run scripts/deploy_all.ts --network celoSepolia
```

### 🛠️ Individual Deployments

```bash
# Deploy individual contracts
npx hardhat run scripts/deploy_token.ts --network celoSepolia
npx hardhat run scripts/deploy_healthidnft.ts --network celoSepolia
npx hardhat run scripts/deploy_engine.ts --network celoSepolia
```

### 🔍 Verification & Testing

```bash
# Verify all contract source code on CeloScan
npx hardhat run scripts/verify_all.ts --network celoSepolia

# Run functional verification tests
npx hardhat run scripts/verify_deployment.ts --network celoSepolia

# Run full test suite
npx hardhat test
```

---

## 🧬 Project Structure

```
FLB/
├── contracts/
│   ├── token/FlameBornToken.sol        # Upgradeable ERC20, zero initial supply
│   ├── engine/FlameBornEngine.sol      # Learn-to-earn engine & governance hooks
│   └── nft/FlameBornHealthIDNFT.sol    # Soulbound health identity NFT
├── scripts/
│   ├── deploy/                        # 001_deploy_token.ts, 002_deploy_engine.ts, 003_wire_roles.ts
│   ├── governance/                    # propose_mint.ts, queue_and_execute.ts
│   ├── read/                          # read_total_supply.ts, read_balance.ts
│   └── verify/                        # verify_all.ts
├── deployments/
│   ├── celoSepolia.json                 # Canonical addresses (proxy, implementation)
│   └── mainnet.json                   # Placeholder manifest
├── test/                          # Comprehensive test suite
├── PROVENANCE.md                  # 🔍 Contract provenance & verification
└── docs/archive/LAUNCH_ANNOUNCEMENT.md         # 📢 Community launch materials
```

---

## 🔧 Functions Overview

### Admin

- `grantRole(bytes32, address)`
- `setRewards(uint256)`
- `pause()`, `unpause()`

### User

- `donate()` → triggers reward
- `mint()` → mint HealthID NFT (if authorized)
- `claimReward()` → FLB token incentives

---

## 🌐 Network Config

- **Testnet**: Celo Sepolia
- **RPC**: `https://celo-sepolia.blockscout.com/api/eth-rpc`
- **Chain ID**: `11142220`
- **Faucet**: [https://faucet.celo.org/](https://faucet.celo.org/)
- **Explorer**: [https://celo-sepolia.blockscout.com](https://celo-sepolia.blockscout.com)

---

## 🔐 Security Highlights

- 🔐 UUPS upgradeable pattern
- 🛡️ OpenZeppelin access roles
- 🔍 Verified deployments on Celoscan
- 🧪 Fully tested contracts (see `/test`)

---

## 📚 Resources

- 📘 [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- 🔧 [Celo Docs](https://docs.celo.org/)
- 🔐 [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- 🌐 [Celo Sepolia self-hosted RPC](docs/CELO_SEPOLIA_NODE.md)
- ⚙️ [Hardhat Docs](https://hardhat.org)

---

## 🤝 Contribute

```bash
git checkout -b feature/amazing-feature
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

Then open a Pull Request ✨

---

## 📄 License

MIT — FlameBorn by \[MoStarAI] & Kairo Covenant
See [LICENSE](LICENSE) for details.

---

## 🔗 Links

- 💾 [GitHub Repo](https://github.com/FlameBorn-1/FLB)
- 🔥 [FLB Token](https://celo-sepolia.blockscout.com/address/0xb48Cc842C41d694260726FacACad556ef3483fEC?tab=index#code)
- **FlameBornEngine (Proxy & Impl)**: `0xE9Fcf860635E7B7C0a372e9aC790391168B56327`
- **FlameBornHealthIDNFT**: `0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6`
- 🔥 [FlameBornEngine](https://celo-sepolia.blockscout.com/address/0xE9Fcf860635E7B7C0a372e9aC790391168B56327?tab=contract)
- 🧠 [Celo](https://celo.org/)
- 🧱 [OpenZeppelin](https://openzeppelin.com/)

---
{{ ... }}

- **Deployment rite**

  1. **Compile** — `npx hardhat compile`
  2. **Deploy** — `npx hardhat run scripts/deploy_all.ts --network celoSepolia`
  3. **Grant minter** — In Hardhat console, call `grantMinterRole("0xE9Fcf860635E7B7C0a372e9aC790391168B56327")` on the new token proxy.
  4. **Verify** — `npx hardhat verify --network celoSepolia <implementationAddress>`
  5. **Initial Supply**: 0 FLB. All minting requires governance-approved `MINTER_ROLE`.
  6. **Total Supply**: Determined by executed governance mints.
  7. **Optional lockdown** — call `revokeMinterRole(<owner address>)` if you want the engine as the sole issuer.

- **Operational checklist**

  - **Test mint flow** — trigger a small engine-driven mint, confirm balances and `totalSupply()` update correctly.
  - **Documentation** — tick off the deployment checklist, then add the “Supply Locked” line to your Genesis announcement draft.

### Completion

Covenantal minting flow is implemented and documented; repository ready for the Genesis 200 deployment sequence.

