# FlameBornToken (FLB) — Daily Monitoring Checklist

## Daily Security Checklist

- **Contract integrity**
  - Confirm the proxy at `0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1` still references the expected implementation.
  - Ensure verification badges remain on both Celoscan and Blockscout.
  - Check `FlameBornToken` and `FlameBornEngine` are not paused unexpectedly.
- **Supply and balances**
  - Compare `totalSupply()` with the cumulative mints recorded in `docs/PROVENANCE.md` (genesis starts at `0`).
  - Review multisig and Engine balances for unexpected deltas.
  - Investigate any transfers greater than 5% of circulating supply.
- **Governance roles**
  - Monitor `RoleGranted` / `RoleRevoked` for `MINTER_ROLE` and `DEFAULT_ADMIN_ROLE`.
  - Confirm ProxyAdmin ownership has not moved.
  - Track pending governance proposals or upgrades.

## Alert Templates

### Email Template

```text
Subject: 🚨 FLB Contract Alert - [ALERT_TYPE]

Contract: 0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1 (Alfajores)
Timestamp: [ISO8601]
Event: [DESCRIPTION]

Immediate Actions:
1. Validate transaction legitimacy
2. Verify ProxyAdmin ownership and implementation slot
3. Inspect governance activity (Safe / Timelock)
4. Notify guardians if unauthorized

Links:
- Contract: https://alfajores.celoscan.io/address/0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1
- Transaction: [TX_HASH]

Guardian on duty: [NAME]
```

### Slack / Discord Template

```text
🚨 **FLB Security Alert**

• Contract: FlameBornToken (0x2806…b5f1)
• Event: [ALERT_TYPE]
• Time: [TIMESTAMP]
• Severity: [HIGH|MEDIUM|LOW]

Action Items:
- [ ] Confirm transaction authenticity
- [ ] Review role assignments (MINTER / ADMIN)
- [ ] Check Engine status & pausable flags
- [ ] Update incident log

Links: https://alfajores.celoscan.io/tx/[TX_HASH]
```

## Monitoring Automation

### Key Metrics

```javascript
const MONITORING_CONFIG = {
  contracts: {
    tokenProxy: "0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1",
    engineProxy: "0x82cA6C5FE9d7E834D908a2482aB76A51D64f5BB4"
  },
  alerts: {
    implementationChange: true,
    adminChange: true,
    minterRoleChange: true,
    pauseEvents: true,
    largeTransfers: {
      thresholdBps: 500 // 5% of supply
    },
    supplyChange: true
  },
  pollIntervalMs: 300000
};
```

### Alert Triggers

- Implementation slot changes
- ProxyAdmin or multisig ownership transfers
- `RoleGranted` / `RoleRevoked` involving `MINTER_ROLE`
- Mint events or transfers beyond policy thresholds
- Loss of verification status or contract pause events

## Team Assignments

- **Primary Guardian**: Executes checklist daily, first responder to alerts, files weekly summary.
- **Backup Guardian**: Covers weekends/holidays, secondary alert recipient, coordinates with Technical Lead.
- **Technical Lead**: Approves upgrades, handles incident response, coordinates public comms.

Escalation path: Guardian (0–15m) → Technical Lead (15–60m) → Full Team (1–4h) → Public update (4–24h).

## Weekly Review Template

```markdown
# FLB Weekly Security Review — [DATE]

## Status Summary
- Contract Health: [HEALTHY/ATTENTION/CRITICAL]
- Verification Status: [VERIFIED/UNVERIFIED]
- Admin Role Changes: [NONE/DETAILS]
- Notable Events: [NONE/DETAILS]

## Metrics
- Total Supply: [AMOUNT] FLB
- Circulating Supply: [AMOUNT] FLB
- Large Transfers: [COUNT]
- Mints Logged in PROVENANCE: [COUNT]

## Security Events
- Upgrade Events: [COUNT]
- MINTER_ROLE Changes: [COUNT]
- Pause Events: [COUNT]
- Alerts Triggered: [COUNT]

## Action Items
- [ ] Item 1
- [ ] Item 2

## Next Week Focus
- Objective 1
- Objective 2

Guardian: [NAME]
Reviewed: [DATE]
```

## Setup Instructions

1. Assign guardians and backups; share credential storage process.
2. Configure email and Slack/Discord webhooks; test delivery.
3. Bookmark Celoscan / Blockscout pages and dashboards.
4. Schedule weekly review, provenance reconciliation, and tokenlist refresh.
5. Maintain an incident contact list and escalation playbook.

## Quick Links

- [Token Proxy](https://alfajores.celoscan.io/address/0x2806D0C068E0Bdd553Fd9d533C40cAFA6657b5f1)
- [Engine Proxy](https://alfajores.celoscan.io/address/0x82cA6C5FE9d7E834D908a2482aB76A51D64f5BB4)
- [HealthID NFT](https://alfajores.celoscan.io/address/0x1566c75a1Bad93a9fa5E2Da690395987E36e08e8)
- [docs/PROVENANCE.md](docs/PROVENANCE.md)
- [GitHub Repository](https://github.com/FlameBorn-1/FLB)

Stay vigilant, stay secure. 🛡️
