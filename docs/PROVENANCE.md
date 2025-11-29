# Provenance — Supply & Actions

## Supply Invariant

- `totalSupply()` at genesis == **0**.
- Every increase traces back to `FlameBornEngine` executing a governance-approved mint.

## Evidence Trail

- Engine emits `MintedByEngine(to, amount, proofRef)` for every mint.
- `proofRef` links to IPFS/Arweave hashes or on-chain identifiers documenting the verified action.

## Reconciliation

- Nightly process:
  1. Pull `Transfer` and `MintedByEngine` logs.
  2. Match against the off-chain action ledger.
  3. Publish CSV/JSON snapshots to `docs/provenance/`.

## Incident Addendum

- Any SEV-1 mint anomaly triggers a dedicated appendix entry describing root cause, impact, and remediation timeline.

## Alfajores Burn Record

- 2025-10-11 — `0x2E75287C542B9b111906D961d58f2617059dDe3c` burned **1,000,000 FLB** (`1e24` wei) via `scripts/ops/burn_all.ts` on Alfajores.
- Transaction hash: `0x6bef0ce88e04c8d85bf370e293aba35642c3e9746b5c67d3e370fdf589fef207`.
- Post-burn `totalSupply()` verification (Forno RPC) returned `0x0` confirming zero outstanding supply on Alfajores.
