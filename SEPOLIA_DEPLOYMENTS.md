# FlameBorn Deployments - Official Record

**Last Updated**: 2026-01-31  
**Primary Network**: Celo Sepolia Testnet (Chain ID: 11142220)

---

## 🟢 Active Deployments - Celo Sepolia Testnet

> [!NOTE]
> Celo Sepolia is the official testnet as of July 2025. Alfajores was deprecated on September 30, 2025.

### Network Details

- **Chain ID**: 11142220
- **RPC URL**: `https://alfajores-forno.celo-testnet.org`
- **Explorer**: <https://celo-sepolia.blockscout.com>
- **Faucet**: <https://faucet.celo.org/sepolia>

### Deployed Contracts

#### 1. FlameBornToken (ERC20 - Upgradeable UUPS)

**Proxy Address**: [`0x93F4c3B97aa4706e0a84f7667eB7f356F138dC60`](https://celo-sepolia.blockscout.com/address/0x93F4c3B97aa4706e0a84f7667eB7f356F138dC60)

- **Contract Name**: `FlameBornToken`
- **Symbol**: `FLB`
- **Decimals**: 18
- **Type**: Upgradeable (UUPS Proxy)
- **Verification**: ✅ Verified
- **Solidity Version**: ^0.8.28
- **Optimizer**: Enabled (800 runs)
- **Features**:
  - ERC20 standard compliance
  - Burnable tokens
  - Pausable (owner control)
  - Role-based minting (MINTER_ROLE)
  - ERC20Permit (gasless approvals)
  - Upgradeable via UUPS pattern

**Key Functions**:

- `mint(address to, uint256 amount)` - Requires MINTER_ROLE
- `burn(uint256 value)` - Anyone can burn their own tokens
- `pause()` / `unpause()` - Owner only
- `grantMinterRole(address)` / `revokeMinterRole(address)` - Owner only

**Admin**: `0x2E75287C542B9b111906D961d58f2617059dDe3c`

---

#### 2. FlameBornHealthIDNFT (Soulbound NFT)

**Contract Address**: [`0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6`](https://celo-sepolia.blockscout.com/address/0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6)

- **Contract Name**: `FlameBornHealthIDNFT`
- **Symbol**: `FLB-HNFT`
- **Type**: Non-upgradeable Soulbound NFT
- **Verification**: ✅ Verified (Nov 29, 2025)
- **Solidity Version**: ^0.8.28
- **Optimizer**: Enabled (800 runs)
- **Features**:
  - ERC721 with URI storage
  - Soulbound (non-transferable after mint)
  - Role-based access control
  - Auto-incrementing token IDs
  - Metadata update capability (admin only)

**Key Functions**:

- `mint(address to)` - Returns token ID, requires MINTER_ROLE
- `mintWithMetadata(address to, string metadataURI)` - Mint with metadata
- `updateMetadata(uint256 tokenId, string metadataURI)` - Admin only
- `totalSupply()` - Returns total minted tokens
- `getCurrentTokenId()` - Returns next token ID

**Roles**:

- `DEFAULT_ADMIN_ROLE`: `0x2E75287C542B9b111906D961d58f2617059dDe3c`
- `MINTER_ROLE`: `0x2E75287C542B9b111906D961d58f2617059dDe3c`
- `MULTISIG_ROLE`: Deployer address

---

#### 3. FlameBornEngine (Main Contract - Upgradeable UUPS)

**Proxy Address**: [`0xb8f4795f1aE3d8f51859d9b1E13d07399db2A5C8`](https://celo-sepolia.blockscout.com/address/0xb8f4795f1aE3d8f51859d9b1E13d07399db2A5C8)

- **Contract Name**: `FlameBornEngine`
- **Type**: Upgradeable (UUPS Proxy)
- **Verification**: ✅ Verified
- **Solidity Version**: ^0.8.28
- **Optimizer**: Enabled (800 runs)
- **Features**:
  - Actor verification and registration
  - Role-based access control (REGISTRAR_ROLE, QUEST_ADMIN_ROLE)
  - Donation tracking with FLB rewards
  - Quest reward system
  - Integration with FlameBornToken and HealthIDNFT
  - Reentrancy protection

**Key Functions**:

- `verifyActor(address, role, name, licenseId, phone)` - Register verified actors
- `donate()` - Accept donations and mint FLB rewards
- `awardQuest(address, reward, questId)` - Distribute quest rewards
- `withdrawDonations(address payable)` - Admin withdrawal
- `isVerifiedActor(address)` - Check verification status

**Configuration**:

- Token: `0x93F4c3B97aa4706e0a84f7667eB7f356F138dC60`
- HealthIDNFT: `0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6`
- Actor Reward: 100 FLB
- Donation Reward Rate: 100 FLB per base unit
- Minimum Donation: Configurable

**Roles**:

- `DEFAULT_ADMIN_ROLE`: Admin address
- `REGISTRAR_ROLE`: Can verify actors
- `QUEST_ADMIN_ROLE`: Can award quest rewards

---

## 📦 Deployment Summary

| Contract | Address | Type | Status | Verified |
|----------|---------|------|--------|----------|
| **FlameBornToken** | `0x93F4...8dC60` | Proxy (UUPS) | ✅ Deployed | ✅ Yes |
| **FlameBornHealthIDNFT** | `0x22Ad...eea6` | Soulbound NFT | ✅ Deployed | ✅ Yes |
| **FlameBornEngine** | `0xb8f4...A5C8` | Proxy (UUPS) | ✅ Deployed | ✅ Yes |

---

## 🔐 Admin Addresses

**Primary Admin**: `0x2E75287C542B9b111906D961d58f2617059dDe3c`

- Controls all admin functions
- Has MINTER_ROLE on both Token and NFT
- Can upgrade FlameBornToken contract
- Can pause/unpause token operations

---

## 🗄️ Archived Deployments - Celo Alfajores (DEPRECATED)

> [!CAUTION]
> **Alfajores testnet was sunset on September 30, 2025**. These deployments are no longer active and should not be used for new development.

### Network Details (Historical)

- **Chain ID**: 44787 (deprecated)
- **Status**: ☠️ Sunset Sept 30, 2025

### Historical Contracts

#### FlameBornToken (Alfajores)

- **Proxy**: `0xd1b6883205eF7021723334D4ec0dc68D0D156b2a`
- **Implementation**: `0x1C6924E0a6Ae373A9b52cbFF66075A72c1B97502`
- **Status**: Archived

#### HealthIDNFT (Alfajores)

- **Address**: `0x115aA20101bd0F95516Cc67ea104eD0B0c642919`
- **Deployed**: July 28, 2025
- **Status**: Archived

#### FlameBornEngine (Alfajores)

- **Proxy**: `0xfF4ea30aC26665B687e023375c6f8AD929cC8788`
- **Implementation**: `0x539962Fdb1AFcEb0BABc329591a49E6c56cC520D`
- **Deployed**: July 31, 2025
- **Status**: Archived

---

## 🚀 Next Steps

### ✅ All Contracts Deployed

**System Status**: 100% Deployed on Sepolia

### Immediate Actions Required

1. **Grant MINTER_ROLE to Engine**

   ```bash
   # On FlameBornToken (0x93F4...8dC60)
   npx hardhat console --network sepolia
   > const token = await ethers.getContractAt("FlameBornToken", "0x93F4c3B97aa4706e0a84f7667eB7f356F138dC60")
   > await token.grantMinterRole("0xb8f4795f1aE3d8f51859d9b1E13d07399db2A5C8")
   
   # On FlameBornHealthIDNFT (0x22Ad...eea6)
   > const nft = await ethers.getContractAt("FlameBornHealthIDNFT", "0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6")
   > const MINTER_ROLE = await nft.MINTER_ROLE()
   > await nft.grantRole(MINTER_ROLE, "0xb8f4795f1aE3d8f51859d9b1E13d07399db2A5C8")
   ```

2. **Integration Testing**
   - Test actor verification flow
   - Test reward distribution
   - Test NFT minting via Engine
   - Test donation and reward mechanism
   - Verify all role permissions

3. **Mainnet Preparation**
   - Final security audit
   - Gas optimization review
   - Create mainnet deployment checklist
   - Prepare mainnet deployment scripts
   - Set up monitoring and alerts

---

## 📚 Resources

### Sepolia Explorers

- **Blockscout**: <https://celo-sepolia.blockscout.com>
- **Celoscan** (if available): Check for Sepolia support

### Development Tools

- **Hardhat Network**: `sepolia` (Chain ID: 11142220)
- **Faucet**: <https://faucet.celo.org/sepolia>
- **RPC Endpoint**: `https://alfajores-forno.celo-testnet.org`

### Documentation

- [Celo Sepolia Migration Guide](https://celo.org/blog/celo-sepolia-testnet)
- [Celo Developer Docs](https://docs.celo.org)

---

**Maintained by**: FlameBorn Development Team  
**Contact**: Admin `0x2E75...De3c`
