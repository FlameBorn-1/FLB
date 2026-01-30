# Grant MINTER_ROLE to FlameBornEngine - Sepolia

## Overview

Now that all three contracts are deployed, the FlameBornEngine needs MINTER_ROLE on both the Token and NFT contracts to function properly.

## Contract Addresses

- **FlameBornToken**: `0x93F4c3B97aa4706e0a84f7667eB7f356F138dC60`
- **FlameBornHealthIDNFT**: `0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6`
- **FlameBornEngine**: `0xb8f4795f1aE3d8f51859d9b1E13d07399db2A5C8`

## Step 1: Grant MINTER_ROLE on FlameBornToken

```bash
npx hardhat console --network sepolia
```

```javascript
// Get the token contract
const token = await ethers.getContractAt(
  "FlameBornToken", 
  "0x93F4c3B97aa4706e0a84f7667eB7f356F138dC60"
);

// Grant MINTER_ROLE to Engine
await token.grantMinterRole("0xb8f4795f1aE3d8f51859d9b1E13d07399db2A5C8");

// Verify the role was granted
const engineAddress = "0xb8f4795f1aE3d8f51859d9b1E13d07399db2A5C8";
const MINTER_ROLE = await token.MINTER_ROLE();
const hasRole = await token.hasRole(MINTER_ROLE, engineAddress);
console.log("Engine has MINTER_ROLE on Token:", hasRole);
```

## Step 2: Grant MINTER_ROLE on FlameBornHealthIDNFT

```javascript
// Get the NFT contract
const nft = await ethers.getContractAt(
  "FlameBornHealthIDNFT",
  "0x22Ad3B84f8B465aF478157752751ae6DcaA7eea6"
);

// Get MINTER_ROLE identifier
const MINTER_ROLE = await nft.MINTER_ROLE();

// Grant MINTER_ROLE to Engine
await nft.grantRole(MINTER_ROLE, "0xb8f4795f1aE3d8f51859d9b1E13d07399db2A5C8");

// Verify the role was granted
const hasRole = await nft.hasRole(MINTER_ROLE, engineAddress);
console.log("Engine has MINTER_ROLE on NFT:", hasRole);
```

## Step 3: Verify Integration

```javascript
// Get the engine contract
const engine = await ethers.getContractAt(
  "FlameBornEngine",
  "0xb8f4795f1aE3d8f51859d9b1E13d07399db2A5C8"
);

// Check engine configuration
const tokenAddress = await engine.token();
const nftAddress = await engine.healthIDNFT();
const actorReward = await engine.actorReward();
const donationRate = await engine.donationRewardRate();

console.log("Engine Configuration:");
console.log("- Token:", tokenAddress);
console.log("- NFT:", nftAddress);
console.log("- Actor Reward:", ethers.formatEther(actorReward), "FLB");
console.log("- Donation Rate:", donationRate.toString(), "FLB per unit");
```

## Step 4: Test Actor Verification (Optional)

```javascript
// Test verifying an actor (requires REGISTRAR_ROLE)
const testAddress = "YOUR_TEST_ADDRESS";

// Check if you have REGISTRAR_ROLE
const REGISTRAR_ROLE = await engine.REGISTRAR_ROLE();
const [signer] = await ethers.getSigners();
const hasRegistrarRole = await engine.hasRole(REGISTRAR_ROLE, signer.address);

if (hasRegistrarRole) {
  // Verify a test actor
  await engine.verifyActor(
    testAddress,
    0, // ActorRole.DOCTOR
    "Test Doctor",
    "LICENSE123",
    "+1234567890"
  );
  
  // Check verification
  const isVerified = await engine.isVerifiedActor(testAddress);
  console.log("Test actor verified:", isVerified);
}
```

## Verification Checklist

- [ ] MINTER_ROLE granted on FlameBornToken
- [ ] MINTER_ROLE granted on FlameBornHealthIDNFT
- [ ] Engine can access Token contract
- [ ] Engine can access NFT contract
- [ ] Actor reward amount is correct (100 FLB)
- [ ] Donation reward rate is correct (100 FLB)
- [ ] Test actor verification works
- [ ] Test donation mechanism works

## Next Steps

After granting roles:

1. Run integration tests
2. Test end-to-end user flows
3. Verify all events are emitted correctly
4. Check gas costs for common operations
5. Prepare for mainnet deployment
