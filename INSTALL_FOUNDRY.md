# Installing Foundry on Windows

## Quick Install (Recommended)

Download and run the official Foundry installer:

```powershell
# Download foundryup installer
Invoke-WebRequest -Uri https://github.com/foundry-rs/foundry/releases/latest/download/foundry_nightly_windows_amd64.zip -OutFile foundry.zip

# Extract
Expand-Archive -Path foundry.zip -DestinationPath C:\Tools\foundry -Force

# Add to PATH (run as admin or add manually)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Tools\foundry", [EnvironmentVariableTarget]::User)
```

## Manual Install

1. Go to: <https://github.com/foundry-rs/foundry/releases>
2. Download `foundry_nightly_windows_amd64.zip`
3. Extract to `C:\Tools\foundry`
4. Add `C:\Tools\foundry` to your PATH

## Verify Installation

```powershell
forge --version
cast --version
anvil --version
```

## Alternative: Use via Docker

If installation fails, you can run Foundry tests via Docker:

```powershell
docker run --rm -v ${PWD}:/app -w /app ghcr.io/foundry-rs/foundry:latest forge test --match-test invariant
```

## After Installation

Close and reopen your terminal, then run:

```bash
forge test --match-test invariant --invariant-runs 1000
forge test --fuzz-runs 5000
```
