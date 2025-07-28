Here's the **updated version** of your `README.md` with the latest deployments including **HealthIDNFT** and structure hints for **FlameBornEngine**:

---

# 🔥 FlameBornToken (FLB) – Celo Blockchain Project

**FlameBornToken** is an upgradeable ERC20 token deployed on the Celo blockchain, empowering digital sovereignty and decentralized innovation.

---

## 🌍 Live Deployments

### ✅ FlameBornToken (ERC20)

* **Proxy Address**: `0xd1b6883205eF7021723334D4ec0dc68D0D156b2a`
* **Implementation Address**: `0x1C6924E0a6Ae373A9b52cbFF66075A72c1B97502`
* **Explorer**: [View on Celoscan](https://alfajores.celoscan.io/address/0xd1b6883205eF7021723334D4ec0dc68D0D156b2a)
* **Deployer**: `0x2E75287C542B9b111906D961d58f2617059dDe3c`

### 🏥 HealthIDNFT (Soulbound NFT)

* **Contract Address**: `0x115aA20101bd0F95516Cc67ea104eD0B0c642919`
* **Explorer**: [View on Celoscan](https://alfajores.celoscan.io/address/0x115aA20101bd0F95516Cc67ea104eD0B0c642919)
* **Type**: Soulbound NFT with Role-Based Access Control
* **Features**: Non-transferable, Auto-Increment Token IDs, Metadata URI, Minter/Admin roles

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

## ✨ Features

* ✅ **ERC20** compliant
* 🔁 **Upgradeable (UUPS)**
* 🔥 **Burnable**
* ⏸️ **Pausable**
* ✍️ **Permit (EIP-2612)**
* 🔐 **Ownable access**
* 🧱 Built with **OpenZeppelin**

---

## 🚀 Quick Start

### ⚙️ Prerequisites

* Node.js v16+
* npm or yarn
* Git & Hardhat

### ⬇️ Install & Setup

```bash
git clone https://github.com/FlameBorn-1/FLB.git
cd FLB
npm install
cp .env.example .env
# 🔑 Add your private key to .env
```

### 🧪 Compile & Test

```bash
npx hardhat compile
npx hardhat test
```

### 🚀 Deploy to Celo Alfajores

```bash
npx hardhat run scripts/deploy_flameborn_celo.ts --network alfajores
```

## 📋 Deployment Logs (FLB Token)

```bash
✅ FlameBornToken deployed
📍 Proxy Address: 0xd1b6883205eF7021723334D4ec0dc68D0D156b2a
🔧 Implementation Address: 0x1C6924E0a6Ae373A9b52cbFF66075A72c1B97502
```

## 🛠️ Scripts

```bash
# Compile
npx hardhat compile

# Deploy FlameBornToken
npx hardhat run scripts/deploy_flameborn_celo.ts --network alfajores

# Deploy HealthIDNFT
npx hardhat run scripts/deploy_healthidnft_celo.ts --network alfajores

# Verify
npx hardhat verify --network alfajores <IMPLEMENTATION_ADDRESS>
```

---

## 🧬 HealthIDNFT Features

* 🧾 Soulbound Identity NFT
* 🎭 Role-Based Minting (MINTER\_ROLE)
* 🔒 Non-transferable (Soulbound)
* 📜 Token Metadata Support
* 🪪 Ideal for health/ID verification protocols

---

## 📁 Project Layout

```
FLB/
├── contracts/
│   ├── FlameBornToken.sol
│   ├── HealthIDNFT.sol
│   ├── FlameBornEngine.sol   # (Deploy next)
├── scripts/
│   ├── deploy_flameborn_celo.ts
│   ├── deploy_healthidnft_celo.ts
│   ├── verify_deployment.ts
├── test/                    # Tests
├── .env.example            # Env config
├── hardhat.config.ts       # Network setup
└── DEPLOYMENT_GUIDE.md     # Deployment walkthrough
```

---

## 🔧 Functions Overview

### 🔐 Admin Functions

* `pause()`, `unpause()`
* `mint(address, amount)`
* `grantRole(bytes32, address)`

### 👤 User Functions

* `transfer(...)`
* `burn(...)`
* `permit(...)`

---

## 🌐 Network Info

* **Network**: Alfajores (Testnet)
* **RPC**: [https://alfajores-forno.celo-testnet.org](https://alfajores-forno.celo-testnet.org)
* **Chain ID**: `44787`
* **Explorer**: [https://alfajores.celoscan.io](https://alfajores.celoscan.io)
* **Faucet**: [https://faucet.celo.org/alfajores](https://faucet.celo.org/alfajores)

---

## 🔐 Security Stack

* 🔒 UUPS upgradeable contracts
* ✅ Role-based access control
* 🧱 OpenZeppelin contract standards
* 🧪 Local test coverage in `/test`

---

## 📚 Documentation & Resources

* 📖 [Deployment Guide](./DEPLOYMENT_GUIDE.md)
* 🔧 [Celo Docs](https://docs.celo.org/)
* 🛡️ [OpenZeppelin](https://docs.openzeppelin.com/)
* 🦾 [TypeChain](https://github.com/dethcrypto/TypeChain)

---

## 🤝 Contribute

```bash
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
```

Open a PR to `main` 🛠️

---

## 📄 License

MIT – Overseer by MoStar Industries [MoStarAI] and Kairo Covenant `LICENSE`

---

## 🔗 Links

* 🔗 [Repo](https://github.com/FlameBorn-1/FLB)
* 📜 [FLB Token](https://alfajores.celoscan.io/address/0xd1b6883205eF7021723334D4ec0dc68D0D156b2a)
* 🩺 [HealthIDNFT](https://alfajores.celoscan.io/address/0x115aA20101bd0F95516Cc67ea104eD0B0c642919)
* 🌐 [Celo](https://celo.org/)
* 🧱 [OpenZeppelin](https://openzeppelin.com/)

