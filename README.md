# FlameBornToken (FLB) - Celo Blockchain Project

🔥 **FlameBornToken** is an upgradeable ERC20 token deployed on the Celo blockchain, embodying the spirit of African sovereignty and decentralized technology.

## 🌍 Live Deployment

**Celo Alfajores Testnet:**
- **Contract Address**: `0xd1b6883205eF7021723334D4ec0dc68D0D156b2a`
- **Implementation**: `0x1C6924E0a6Ae373A9b52cbFF66075A72c1B97502`
- **Explorer**: [View on Celoscan](https://alfajores.celoscan.io/address/0xd1b6883205eF7021723334D4ec0dc68D0D156b2a)
- **Deployer**: `0x2E75287C542B9b111906D961d58f2617059dDe3c`

## 📊 Token Details

- **Name**: FlameBornToken
- **Symbol**: FLB
- **Decimals**: 18
- **Initial Supply**: 1,000,000 FLB
- **Type**: Upgradeable ERC20 with advanced features

## ✨ Features

### FlameBornToken (FLB)
- ✅ **ERC20 Standard**: Full ERC20 compatibility
- ✅ **Upgradeable**: UUPS (Universal Upgradeable Proxy Standard) pattern
- ✅ **Burnable**: Token holders can burn their tokens
- ✅ **Pausable**: Owner can pause/unpause transfers
- ✅ **Permit**: EIP-2612 gasless approvals
- ✅ **Ownable**: Access control for administrative functions
- ✅ **Security**: OpenZeppelin battle-tested contracts

### HealthIDNFT (HID)
- ✅ **ERC721 Standard**: For unique, non-fungible tokens.
- ✅ **Soulbound**: Tokens are non-transferable, permanently linking a HealthID to an address.
- ✅ **Role-Based Access Control**:
  - `DEFAULT_ADMIN_ROLE`: Manages all other roles.
  - `MINTER_ROLE`: Can mint new HealthID NFTs.
  - `MULTISIG_ROLE`: Can update token metadata.
- ✅ **URI Storage**: Allows for storing metadata URIs (e.g., pointing to IPFS).

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Git

### Installation

```bash
git clone https://github.com/FlameBorn-1/FLB.git
cd FLB
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your private key and configuration
```

### Compile Contracts

```bash
npx hardhat compile
```

### Deploy to Celo Alfajores

```bash
npx hardhat run scripts/deploy_flameborn_celo.ts --network alfajores
```

## 📋 Deployment Output

```
🔥 Deploying FlameBornToken to Celo Alfajores...
Deploying with account: 0x2E75287C542B9b111906D961d58f2617059dDe3c
Account balance: 5.378320338128 CELO
📋 Contract deployment parameters:
- Initial Owner: 0x2E75287C542B9b111906D961d58f2617059dDe3c
- Token Name: FlameBornToken
- Token Symbol: FLB
- Initial Supply: 1,000,000 FLB
🚀 Deploying upgradeable proxy...
✅ FlameBornToken deployed successfully!
📍 Proxy Address: 0xd1b6883205eF7021723334D4ec0dc68D0D156b2a
🔧 Implementation Address: 0x1C6924E0a6Ae373A9b52cbFF66075A72c1B97502

🔍 Verifying deployment...
✅ Deployment verification:
- Name: FlameBornToken
- Symbol: FLB
- Decimals: 18
- Total Supply: 1000000.0 FLB
- Owner: 0x2E75287C542B9b111906D961d58f2617059dDe3c
- Owner Balance: 1000000.0 FLB
```

## 🛠️ Available Scripts

### Development

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start local node
npx hardhat node

# Deploy to Alfajores
npx hardhat run scripts/deploy_flameborn_celo.ts --network alfajores

# Verify deployment
npx hardhat run scripts/verify_deployment.ts --network alfajores <CONTRACT_ADDRESS>
```

### Network Configuration

The project is configured for:
- **Alfajores Testnet** (Chain ID: 44787)
- **Celo Mainnet** (Chain ID: 42220)

## 📁 Project Structure

```
FLB/
├── contracts/
│   ├── FlameBornToken.sol      # Main token contract
│   ├── Lock.sol                # Sample contract
│   └── Greeter.sol             # Sample contract
├── scripts/
│   ├── deploy_flameborn_celo.ts # Deployment script
│   └── verify_deployment.ts     # Verification script
├── test/                       # Test files
├── hardhat.config.ts          # Hardhat configuration
├── DEPLOYMENT_GUIDE.md        # Detailed deployment guide
└── README.md                  # This file
```

## 🔧 Contract Functions

### Owner Functions
- `pause()` - Pause all token transfers
- `unpause()` - Resume token transfers
- `mint(address to, uint256 amount)` - Mint new tokens

### User Functions
- `transfer(address to, uint256 amount)` - Transfer tokens
- `approve(address spender, uint256 amount)` - Approve spending
- `burn(uint256 amount)` - Burn your tokens
- `permit(...)` - Gasless approvals via signature

## 🌐 Network Information

### Celo Alfajores Testnet
- **RPC URL**: https://alfajores-forno.celo-testnet.org
- **Chain ID**: 44787
- **Explorer**: https://alfajores.celoscan.io
- **Faucet**: https://faucet.celo.org/alfajores

## 🔐 Security

- Built with OpenZeppelin's battle-tested contracts
- Upgradeable using UUPS pattern for future improvements
- Owner-controlled administrative functions
- Comprehensive access controls

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [Celo Documentation](https://docs.celo.org/)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: https://github.com/FlameBorn-1/FLB
- **Contract**: https://alfajores.celoscan.io/address/0xd1b6883205eF7021723334D4ec0dc68D0D156b2a
- **Celo**: https://celo.org/
- **OpenZeppelin**: https://openzeppelin.com/

---

*"When the lion learns to code, the hunter's story ends."* 🦁

Built with ❤️ for African sovereignty and decentralized technology.
