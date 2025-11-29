# Security Playbook

## Key Principles

- Least privilege: only `FlameBornEngine` mints; admin functions live behind a timelock or multisig.
- No upgrade surprises: document any UUPS/proxy moves and publish implementation addresses.

## Controls

- Role separation: Deployer ≠ Admin ≠ Engine operators.
- Rate limiting: Engine enforces per-period mint caps aligned with governance policy.
- Monitoring:
  - Watch events: `RoleGranted`, `RoleRevoked`, `Transfer`, `MintedByEngine`.
  - Alert on any `MINTER_ROLE` changes, mints above policy caps, or unexpected `totalSupply()` deltas.

## Incident Response

- **SEV-1 (suspected compromise):**
  1. Freeze via governance runbook (pause Engine/Token if supported).
  2. `Token.revokeRole(MINTER_ROLE, Engine)`.
  3. Rotate admin keys through the timelock/multisig.
  4. Publish a post-mortem within 72 hours; log actions in `docs/PROVENANCE.md`.

## Audits

- Run an internal checklist on every release.
- Commission an external audit before mainnet deployment or major upgrades.
