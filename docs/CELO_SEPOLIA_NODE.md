# Celo Sepolia L2 Node (Self-Hosted RPC)

Summary of the Celo L2 node guide for teams that want their own RPC instead of a public endpoint.

## Hardware

- Sepolia testnet: 16GB+ RAM, 500GB+ NVMe SSD, 4-8 CPU, 100Mbps+ downlink.
- Mainnet: 16GB+ RAM, 1TB+ NVMe SSD, 4-8 CPU, 100Mbps+ downlink.

## Network facts

- Chain ID: 11142220
- Stablecoin: cUSD on Sepolia `0x4822e58de6f5e485eF90df51C41CE01721331dC0`
- Sequencer HTTP: `https://sequencer.celo-sepolia.celo-testnet.org`
- Default public RPC: `https://celo-sepolia.blockscout.com/api/eth-rpc`

## Quick Start (Full Node, Snap Sync)

```bash
git clone https://github.com/celo-org/celo-l2-node-docker-compose.git
cd celo-l2-node-docker-compose
export NETWORK=celo-sepolia   # or mainnet
cp $NETWORK.env .env          # start from the network defaults
docker-compose up -d --build  # start op-geth + op-node stack
```

### Common .env tweaks

- `OP_GETH__SYNCMODE=snap` (default) or `full` if you have a migrated L1 datadir.
- `DATADIR_PATH=<path>` when using full sync with migrated data.
- `NODE_TYPE=archive` if you need archive state; otherwise keep default full.
- P2P discoverability: set `OP_NODE__P2P_ADVERTISE_IP` and `PORT__OP_NODE_P2P` (default 9222). For op-geth, set `OP_GETH__NAT=extip:<public-ip>` and `PORT__OP_GETH_P2P` (default 30303).
- Sequencer HTTP (if not in defaults): `--rollup.sequencerhttp=https://sequencer.celo-sepolia.celo-testnet.org`.
- Public RPC history indexer: ensure op-geth flag `--history.transactions=0` so tx lookups by hash work.

### Monitor sync

```bash
docker-compose logs -n 50 -f op-geth
```

### Verify block height

```bash
cast block-number --rpc-url http://localhost:9993
```

When synced, RPC head should advance and be >0.

## Archive Node Notes

- Use `NODE_TYPE=archive` and `OP_GETH__SYNCMODE=full`.
- Provide pre-hardfork archive data via `HISTORICAL_RPC_DATADIR_PATH=<path>` or point to an existing legacy archive RPC with `OP_GETH__HISTORICAL_RPC=<url>`.
- Do not reuse a live datadir while another node is running.

## Useful RPC Endpoints (public)

- Blockscout RPC (works today): `https://celo-sepolia.blockscout.com/api/eth-rpc`
- Ankr: `https://rpc.ankr.com/celo_sepolia`

If you self-host, set `CELO_SEPOLIA_RPC_URL=http://localhost:9993` in your app `.env`.

## Migration checklist (Alfajores to Sepolia L2)

1) Create a fresh env stub without touching current secrets:

```powershell
./migrate-to-sepolia.ps1
```

2) Copy `.env.sepolia.example` to `.env` and set:

- `PRIVATE_KEY` and `BACKEND_WALLET_ADDRESS`
- `CELO_SEPOLIA_RPC_URL` (use your node or a public RPC)
- `CUSD_ADDRESS=0x4822e58de6f5e485eF90df51C41CE01721331dC0`

# 3) Hardhat deploy on Sepolia

```bash
npm run deploy:sepolia   # uses network "celoSepolia" and saves deployments/addresses.json
```

4) Update app configs to the new chain:

- Backend `.env`: `CHAIN_ID=11142220`, `CELO_RPC_URL=<your RPC>`, and the new contract addresses.
- Frontend `.env.local`: set the Sepolia addresses, `VITE_CHAIN_ID=11142220`, and RPC URL.

5) Verify RPC health before cutting over:

```bash
cast block-number --rpc-url $CELO_SEPOLIA_RPC_URL
cast chain-id --rpc-url $CELO_SEPOLIA_RPC_URL   # should return 11142220
```

## Bootnodes (Sepolia examples)

- op-geth bootnodes: see upstream docs if you need manual `--bootnodes` overrides.
- op-node static peers: see upstream docs if you need manual `--p2p.bootnodes`.

## Troubleshooting

- 0 blocks returned: node still syncing; wait until head >0.
- Tx not executed: ensure `--rollup.sequencerhttp=https://sequencer.celo-sepolia.celo-testnet.org`.
- Tx not found by hash on public RPC: set `--history.transactions=0`.
