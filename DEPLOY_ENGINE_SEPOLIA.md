# Deploy FlameBornEngine to Sepolia - Quick Guide

## Prerequisites

✅ **Already Deployed on Sepolia**:

- FlameBornToken: `0x93F4c3B97aa4706e0a84f7667eB7f356F138dC60`
- FlameBornHealthIDNFT: `0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6`

## Step 1: Update Deployment Script

Edit `scripts/deploy_engine_celo.ts`:

```typescript
const config = {
  sepolia: {
    flbTokenAddress: "0x93F4c3B97aa4706e0a84f7667eB7f356F138dC60",
    healthIdNftAddress: "0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6",
    actorReward: ethers.parseUnits("100", 18), // 100 FLB
    donationRewardRate: 100n, // 100 FLB per base unit
  },
  // Keep alfajores for reference (deprecated)
  alfajores: {
    // ... existing config
  }
}
```

## Step 2: Deploy

```bash
npx hardhat run scripts/deploy_engine_celo.ts --network sepolia
```

## Step 3: Grant Roles

After deployment, grant MINTER_ROLE to the Engine:

```bash
# On FlameBornToken
npx hardhat console --network sepolia
> const token = await ethers.getContractAt("FlameBornToken", "0x93F4c3B97aa4706e0a84f7667eB7f356F138dC60")
> await token.grantMinterRole("ENGINE_ADDRESS_HERE")

# On FlameBornHealthIDNFT
> const nft = await ethers.getContractAt("FlameBornHealthIDNFT", "0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6")
> await nft.grantRole(await nft.MINTER_ROLE(), "ENGINE_ADDRESS_HERE")
```

## Step 4: Verify

Check on Blockscout:
<https://celo-sepolia.blockscout.com/address/ENGINE_ADDRESS>

## Post-Deployment Checklist

- [ ] Engine deployed and verified
- [ ] MINTER_ROLE granted on Token
- [ ] MINTER_ROLE granted on NFT
- [ ] Test actor verification
- [ ] Test reward distribution
- [ ] Update SEPOLIA_DEPLOYMENTS.md
- [ ] Create `.openzeppelin/celo-sepolia.json`
