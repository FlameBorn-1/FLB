# Governance — Roles, Timelock, and Proposals

## Roles

- `DEFAULT_ADMIN_ROLE`: rotate to a multisig or timelock admin as quickly as operationally possible.
- `MINTER_ROLE`: assign exclusively to `FlameBornEngine`. Never grant to EOAs.

## Proposal Flow (Timelock + Governor)

1. **Propose** actions such as `Token.grantRole(MINTER_ROLE, Engine)` or `Engine.mint(...)`.
2. **Queue** once voting period closes with quorum and approval.
3. **Execute** after timelock delay.

## Thresholds & Quorum (Recommendations)

- **Quorum**: 4–8% of total voting power at snapshot.
- **Proposal threshold**: 0.1–0.5% of voting power, or gate proposals through a guardian committee.

## Minting Policy

- Zero constructor mint.
- Mint path: `Engine -> Token.mint()` only on verified events (on-chain proofs / off-chain attestation bridged).
- A single genesis mint of 1,000,000 FLB to the founder wallet may occur post-deploy and must be recorded in `docs/PROVENANCE.md`.
- Hard limits:
  - Per-event cap.
  - Daily/weekly circuit breaker in Engine.
  - Governance-updatable emission parameters.

## Revocation & Emergency Response

- If the Engine is compromised:
  1. `Token.revokeRole(MINTER_ROLE, Engine)`.
  2. Pause Engine (if Pausable) and Token transfers if necessary.
  3. Rotate admin keys through the timelock/multisig.
  4. Run a post-mortem within 72 hours and append findings to `docs/PROVENANCE.md`.
