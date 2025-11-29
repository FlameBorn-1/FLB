Write-Host "CELO SEPOLIA MIGRATION" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Yellow

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

# Create a fresh Sepolia env template without touching any existing .env
$templatePath = ".env.sepolia.example"
if (-not (Test-Path $templatePath)) {
@"
# Required keys for Celo Sepolia
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
BACKEND_WALLET_ADDRESS=0xYOUR_BACKEND_WALLET
CELO_SEPOLIA_RPC_URL=https://celo-sepolia.blockscout.com/api/eth-rpc
CELOSCAN_API_KEY=
CUSD_ADDRESS=0x4822e58de6f5e485eF90df51C41CE01721331dC0
"@ | Out-File -FilePath $templatePath -Encoding utf8 -NoNewline
    Write-Host "Created $templatePath" -ForegroundColor Green
} else {
    Write-Host "Found existing $templatePath (unchanged)" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1) Copy .env.sepolia.example to .env and set PRIVATE_KEY/BACKEND_WALLET_ADDRESS."
Write-Host "2) Fund the deployer on Celo Sepolia: https://faucet.celo.org/."
Write-Host "3) Compile contracts: npx hardhat compile"
Write-Host "4) Deploy everything: npm run deploy:sepolia"
Write-Host ""
Write-Host "Artifacts will be saved to deployments/addresses.json for reuse."
