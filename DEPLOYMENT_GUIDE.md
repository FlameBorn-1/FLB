# FlameBornToken Deployment Guide

## Prerequisites

1. **Node.js and npm** installed
2. **Hardhat** project setup (already configured)
3. **Celo Alfajores testnet CELO** for gas fees
4. **Private key** of the deployer account

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` file with your details:

```env
# Your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Optional: For contract verification
CELOSCAN_API_KEY=your_celoscan_api_key_here
```

### 2. Get Testnet CELO

Visit the [Celo Alfajores Faucet](https://faucet.celo.org/alfajores) to get testnet CELO:

1. Connect your wallet or enter your address
2. Request testnet CELO tokens
3. Wait for the transaction to complete

### 3. Compile Contracts

```bash
npx hardhat compile
```

### 4. Deploy to Alfajores

Run the deployment script:

```bash
npx hardhat run scripts/deploy_flameborn_celo.ts --network alfajores
```

## Expected Output

The deployment script will:

1. ✅ Check deployer account balance
2. 🚀 Deploy the upgradeable proxy contract
3. 🔧 Display implementation address
4. 🔍 Verify deployment with token details
5. 📄 Show deployment summary
6. 🌍 Provide Celoscan link

## Contract Details

- **Name**: FlameBornToken
- **Symbol**: FLB
- **Decimals**: 18
- **Initial Supply**: 1,000,000 FLB
- **Type**: Upgradeable ERC20 with burn, pause, and permit features

## Post-Deployment

After successful deployment:

1. **Verify Contract**: Use the Celoscan link to verify the contract
2. **Test Functions**: Try basic operations (transfer, burn, pause)
3. **Set Permissions**: Configure any additional access controls if needed

## Troubleshooting

### Common Issues

1. **Insufficient Balance**: Ensure you have enough CELO for gas fees
2. **Network Issues**: Check your internet connection and RPC endpoint
3. **Private Key**: Ensure your private key is correct and has no 0x prefix

### Gas Estimation

Typical gas costs on Alfajores:
- Deployment: ~2-3 CELO
- Basic transactions: ~0.001 CELO

## Network Information

- **Network**: Celo Alfajores Testnet
- **Chain ID**: 44787
- **RPC URL**: https://alfajores-forno.celo-testnet.org
- **Explorer**: https://alfajores.celoscan.io

## Security Notes

⚠️ **Important**: 
- Never commit your `.env` file to version control
- Use a dedicated deployment wallet for testnet
- Keep your private keys secure

## Support

For issues or questions:
- Check [Celo Documentation](https://docs.celo.org/)
- Visit [Celo Discord](https://discord.gg/celo)
- Review [Hardhat Documentation](https://hardhat.org/docs)