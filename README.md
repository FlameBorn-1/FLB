# 🔥 FlameBornToken (FLB) – Celo Blockchain Project

**FlameBornToken** is an upgradeable ERC20 token deployed on the Celo blockchain, empowering digital sovereignty and decentralized innovation.

---

## 🌍 Live Deployments

### ✅ FlameBornToken (ERC20)

* **Proxy Address**: `0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1`
* **Implementation Address**: `0x1C6924E0a6Ae373A9b52cbFF66075A72c1B97502`
* **Explorer**: [View on Celoscan](https://alfajores.celoscan.io/address/0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1)
* **Deployer**: `0x2E75287C542B9b111906D961d58f2617059dDe3c`

### 🏥 FlameBornHealthIDNFT (FLB-HNFT)

* **Contract Address**: `0x1566c75a1Bad93a9fa5E2Da690395987E36e08e8`
* **Explorer**: [View on Celoscan](https://alfajores.celoscan.io/address/0x1566c75a1Bad93a9fa5E2Da690395987E36e08e8)
* **Type**: Soulbound NFT with Role-Based Access Control
* **Features**: Non-transferable, Auto-Increment Token IDs, Metadata URI, Minter/Admin roles

### 🔥 FlameBornEngine (FLB-E)

* **Proxy Address**: `0x82cA6C5FE9d7E834D908a2482aB76A51D64f5BB4`
* **Implementation Address**: `0xE8CEb669437E93208D605dE18433E46297F21cb1`
* **Explorer**: [View on Celoscan](https://alfajores.celoscan.io/address/0x82cA6C5FE9d7E834D908a2482aB76A51D64f5BB4)
* **Tag**: `FLB-EN`
* **Linked Contracts**:
  * **FLB Token**: `0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1`
  * **HealthIDNFT**: `0x1566c75a1Bad93a9fa5E2Da690395987E36e08e8`
* **Features**:
  * Role-driven interaction logic
  * Reward distribution (FLB)
  * Learn-to-Earn & Donation mechanics
  * Modular controller engine

---



## ✅ Verification Status

* FlameBornToken implementation [verified on Celoscan](https://alfajores.celoscan.io/address/0x1C6924E0a6Ae373A9b52cbFF66075A72c1B97502#code)
* FlameBornHealthIDNFT [verified on Celoscan](https://alfajores.celoscan.io/address/0x1566c75a1Bad93a9fa5E2Da690395987E36e08e8#code)
* FlameBornEngine implementation [verified on Celoscan](https://alfajores.celoscan.io/address/0xE8CEb669437E93208D605dE18433E46297F21cb1#code)
* Proxy contracts are linked to their implementations.

---

## ✅ Test Coverage

The FlameBornEngine has been thoroughly tested with 5 key test cases:

1. **Actor Verification**
   * Verifies actors and mints NFT + FLB rewards
   * Validates role-based access control

2. **Donation Processing**
   * Tests CELO donations and FLB rewards
   * Verifies donor balances tracking

3. **Quest Rewards**
   * Validates FLB distribution for completed quests
   * Tests reward tracking system

4. **Withdrawals**
   * Verifies admin withdrawal functionality
   * Ensures proper fund accounting

5. **Access Control**
   * Validates role-based permissions
   * Tests custom error messages for unauthorized access

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

### Deploy (Celo Alfajores)

```sh
npx hardhat run scripts/deploy_engine_celo.ts --network alfajores
```

### Verify on Celoscan

```sh
npx hardhat verify --network alfajores 0xfF4ea30aC26665B687e023375c6f8AD929cC8788
```

### Test Engine Functionality

* Use the frontend or scripts to interact with the contract.
* Ensure all functions (donation, rewards, actor verification, etc.) work as expected.

---

## 📊 Token Info

| Property     | Value                               |
| ------------ | ----------------------------------- |
| **Name**     | FlameBornToken                      |
| **Symbol**   | FLB                                 |
| **Decimals** | 18                                  |
| **Supply**   | 1,000,000 FLB                       |
| **Standard** | Upgradeable ERC20                   |
| **Access**   | Ownable, Pausable, Burnable, Permit |

---

## ✨ Key Features

### 🔥 FlameBornToken (FLB)

* ✅ ERC20-compliant & upgradeable
* 🔄 Burnable & pausable
* 🪪 EIP-2612 permit support
* 🔐 OpenZeppelin audited contracts

### 🏥 HealthIDNFT (HID)

* 🧾 Soulbound (non-transferable)
* 🛡️ Role-based minting and access
* 📜 IPFS/URI metadata support

### ⚙️ FlameBornEngine

* ⚡ Learn-to-Earn reward distribution
* 🤝 Ties NFT and token logic together
* 🎯 Modular controller pattern (admin-controlled)
* 🧬 Donation-driven FLB mechanics

---

## 🚀 Quick Start

### 🧰 Prerequisites

* Node.js v16+
* npm or yarn
* Hardhat & Git

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

```bash
# Deploy Token
npx hardhat run scripts/deploy_flameborn_celo.ts --network alfajores

# Deploy HealthIDNFT
npx hardhat run scripts/deploy_healthidnft_celo.ts --network alfajores

# Deploy FlameBornEngine
npx hardhat run scripts/deploy_engine_celo.ts --network alfajores
```

---

## 🛠️ Script Utilities

```bash
# Verify a deployed contract
npx hardhat verify --network alfajores <CONTRACT_ADDRESS>
```

---

## 🧬 Contract Layout

```bash
FLB/
├── contracts/
│   ├── FlameBornToken.sol
│   ├── HealthIDNFT.sol
│   ├── FlameBornEngine.sol
├── scripts/
│   ├── deploy_flameborn_celo.ts
│   ├── deploy_healthidnft_celo.ts
│   ├── deploy_engine_celo.ts
│   └── verify_deployment.ts
├── test/
├── .env.example
├── hardhat.config.ts
└── DEPLOYMENT_GUIDE.md
``` bash

---

## 🔧 Functions Overview

### Admin

* `grantRole(bytes32, address)`
* `setRewards(uint256)`
* `pause()`, `unpause()`

### User

* `donate()` → triggers reward
* `mint()` → mint HealthID NFT (if authorized)
* `claimReward()` → FLB token incentives

---

## 🌐 Network Config

* **Testnet**: Celo Alfajores
* **RPC**: `https://alfajores-forno.celo-testnet.org`
* **Chain ID**: `44787`
* **Faucet**: [https://faucet.celo.org/alfajores](https://faucet.celo.org/alfajores)
* **Explorer**: [https://alfajores.celoscan.io](https://alfajores.celoscan.io)

---

## 🔐 Security Highlights

* 🔐 UUPS upgradeable pattern
* 🛡️ OpenZeppelin access roles
* 🔍 Verified deployments on Celoscan
* 🧪 Fully tested contracts (see `/test`)

---

## 📚 Resources

* 📘 [Deployment Guide](./DEPLOYMENT_GUIDE.md)
* 🔧 [Celo Docs](https://docs.celo.org/)
* 🔐 [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
* ⚙️ [Hardhat Docs](https://hardhat.org)

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

* 💾 [GitHub Repo](https://github.com/FlameBorn-1/FLB)
* 🔥 [FLB Token](https://alfajores.celoscan.io/token/0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1)
* 🩺 [FlameBornHealthIDNFT](https://alfajores.celoscan.io/token/0x1566c75a1Bad93a9fa5E2Da690395987E36e08e8)
* 🔥 [FlameBornEngine](https://alfajores.celoscan.io/address/0x82cA6C5FE9d7E834D908a2482aB76A51D64f5BB4)
* 🧠 [Celo](https://celo.org/)
* 🧱 [OpenZeppelin](https://openzeppelin.com/)

---

*"When the LION learns to CODE, the HUNTER's story ends."* 🦁
