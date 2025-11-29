# Ops Runbooks

## Read Total Supply

```bash
npm run read:supply --
```

## Read Wallet Balance

```bash
ADDR=<wallet_address> npm run read:balance --
```

## Grant `MINTER_ROLE` to Engine (governance EOA for testnets ONLY)
{{ ... }}
```bash
npm run gov:grant-minter -- FLB_ADDR=0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1 MINTER=0x82cA6C5FE9d7E834D908a2482aB76A51D64f5BB4
```

## One-Time Genesis Mint Flow

```bash
# 1. Temporarily grant MINTER_ROLE to founder wallet
FLB_ADDR=0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1 MINTER=<FOUNDER> npm run gov:grant-minter --

# 2. Mint 1,000,000 FLB (18 decimals) to founder
FLB_ADDR=0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1 TO=<FOUNDER> AMOUNT=1000000000000000000000000 npm run token:mint-once --

# 3. Revoke founder MINTER_ROLE
FLB_ADDR=0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1 MINTER=<FOUNDER> npm run gov:revoke-minter --

# 4. Ensure Engine holds MINTER_ROLE
FLB_ADDR=0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1 MINTER=0x82cA6C5FE9d7E834D908a2482aB76A51D64f5BB4 npm run gov:grant-minter --
```

## Propose / Queue / Execute (Governor + Timelock)

```bash
MINT_TO=0xRecipient MINT_AMOUNT=1000 npm run gov:propose-mint --
PROPOSAL_ID=<proposal_id> GOVERNOR=<governor_address> npm run gov:queue --
PROPOSAL_ID=<proposal_id> GOVERNOR=<governor_address> npm run gov:execute --
```

## Verify Suite

```bash
FLB_ADDR=0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1 FLB_ADMIN=<admin_address> npm run verify:flb --
npm run verify:all
```
