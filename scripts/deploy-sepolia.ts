import { ethers, upgrades } from "hardhat";
import { createDeployHelper } from "../utils/deployHelper";

const CUSD_SEPOLIA_DEFAULT = "0x4822e58de6f5e485eF90df51C41CE01721331dC0";

async function deployToken(helper: ReturnType<typeof createDeployHelper>, deployer: string) {
  if (helper.isDeployed("FlameBornToken")) {
    const existing = helper.getAddress("FlameBornToken");
    console.log(`FlameBornToken already deployed at: ${existing}`);
    return existing!;
  }

  console.log("Deploying FlameBornToken proxy...");
  const Token = await ethers.getContractFactory("FlameBornToken");
  const token = await upgrades.deployProxy(Token, [deployer], {
    initializer: "initialize",
    kind: "uups"
  });
  await token.waitForDeployment();

  const address = await token.getAddress();
  const impl = await upgrades.erc1967.getImplementationAddress(address);
  helper.saveDeployment("FlameBornToken", address, token.deploymentTransaction()?.hash, impl);
  console.log(`Token deployed at ${address} (implementation ${impl})`);
  return address;
}

async function deployHealthId(helper: ReturnType<typeof createDeployHelper>, deployer: string) {
  if (helper.isDeployed("FlameBornHealthIDNFT")) {
    const existing = helper.getAddress("FlameBornHealthIDNFT");
    console.log(`HealthID NFT already deployed at: ${existing}`);
    return existing!;
  }

  console.log("Deploying FlameBornHealthIDNFT...");
  const HealthNFT = await ethers.getContractFactory("FlameBornHealthIDNFT");
  const nft = await HealthNFT.deploy(deployer);
  await nft.waitForDeployment();

  const address = await nft.getAddress();
  helper.saveDeployment("FlameBornHealthIDNFT", address, nft.deploymentTransaction()?.hash);
  console.log(`HealthID NFT deployed at ${address}`);
  return address;
}

async function deployEngine(
  helper: ReturnType<typeof createDeployHelper>,
  deployer: string,
  tokenAddress: string,
  nftAddress: string
) {
  if (helper.isDeployed("FlameBornEngine")) {
    const existing = helper.getAddress("FlameBornEngine");
    console.log(`FlameBornEngine already deployed at: ${existing}`);
    return existing!;
  }

  console.log("Deploying FlameBornEngine proxy...");
  const Engine = await ethers.getContractFactory("FlameBornEngine");
  const engine = await upgrades.deployProxy(
    Engine,
    [
      deployer,
      tokenAddress,
      nftAddress,
      ethers.parseEther("100"), // actorReward
      1000 // donationRewardRate
    ],
    {
      initializer: "initialize",
      kind: "uups"
    }
  );
  await engine.waitForDeployment();

  const address = await engine.getAddress();
  const impl = await upgrades.erc1967.getImplementationAddress(address);
  helper.saveDeployment("FlameBornEngine", address, engine.deploymentTransaction()?.hash, impl);

  console.log("Granting MINTER_ROLE to engine on token and NFT...");
  const token = await ethers.getContractAt("FlameBornToken", tokenAddress);
  await (await token.grantRole(await token.MINTER_ROLE(), address)).wait();

  const nft = await ethers.getContractAt("FlameBornHealthIDNFT", nftAddress);
  await (await nft.grantRole(await nft.MINTER_ROLE(), address)).wait();

  console.log(`Engine deployed at ${address} (implementation ${impl})`);
  return address;
}

async function deployGrantManager(helper: ReturnType<typeof createDeployHelper>, deployer: string, stableAddress: string) {
  if (helper.isDeployed("GrantManager")) {
    const existing = helper.getAddress("GrantManager");
    console.log(`GrantManager already deployed at: ${existing}`);
    return existing!;
  }

  console.log("Deploying GrantManager...");
  const GrantManager = await ethers.getContractFactory("GrantManager");
  const grant = await GrantManager.deploy(stableAddress, deployer);
  await grant.waitForDeployment();

  const address = await grant.getAddress();
  helper.saveDeployment("GrantManager", address, grant.deploymentTransaction()?.hash);
  console.log(`GrantManager deployed at ${address} (cUSD: ${stableAddress})`);
  return address;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const helper = createDeployHelper(network.name);

  console.log("-----");
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log("-----");

  helper.setDeployer(deployer.address);

  const cusdAddress = process.env.CUSD_ADDRESS || CUSD_SEPOLIA_DEFAULT;
  const backend = process.env.BACKEND_WALLET_ADDRESS;

  const tokenAddress = await deployToken(helper, deployer.address);
  const nftAddress = await deployHealthId(helper, deployer.address);
  const engineAddress = await deployEngine(helper, deployer.address, tokenAddress, nftAddress);
  const grantManager = await deployGrantManager(helper, deployer.address, cusdAddress);

  if (backend && backend !== "your_backend_wallet_here") {
    console.log(`Granting roles to backend ${backend}...`);
    const token = await ethers.getContractAt("FlameBornToken", tokenAddress);
    await (await token.grantRole(await token.MINTER_ROLE(), backend)).wait();

    const nft = await ethers.getContractAt("FlameBornHealthIDNFT", nftAddress);
    await (await nft.grantRole(await nft.MINTER_ROLE(), backend)).wait();

    const grant = await ethers.getContractAt("GrantManager", grantManager);
    await (await grant.grantRole(await grant.DISTRIBUTOR_ROLE(), backend)).wait();
    console.log("Backend roles granted.");
  }

  console.log("\nDeployment summary:");
  console.log(`FLB Token:        ${tokenAddress}`);
  console.log(`HealthID NFT:     ${nftAddress}`);
  console.log(`FlameBorn Engine: ${engineAddress}`);
  console.log(`GrantManager:     ${grantManager}`);
  console.log(`cUSD (Sepolia):   ${cusdAddress}`);

  console.log("\nFrontend .env.local values:");
  console.log(`VITE_FLB_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`VITE_HEALTHID_NFT_ADDRESS=${nftAddress}`);
  console.log(`VITE_ENGINE_ADDRESS=${engineAddress}`);
  console.log(`VITE_GRANT_MANAGER_ADDRESS=${grantManager}`);
  console.log(`VITE_CUSD_ADDRESS=${cusdAddress}`);
  console.log("VITE_CHAIN_ID=11142220");
  console.log("VITE_RPC_URL=https://celo-sepolia-rpc.publicnode.com");

  console.log("\nBackend .env values:");
  console.log(`FLB_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`HEALTHID_NFT_ADDRESS=${nftAddress}`);
  console.log(`ENGINE_ADDRESS=${engineAddress}`);
  console.log(`GRANT_MANAGER_ADDRESS=${grantManager}`);
  console.log(`CUSD_ADDRESS=${cusdAddress}`);
  console.log("CELO_RPC_URL=https://celo-sepolia-rpc.publicnode.com");
  console.log("CHAIN_ID=11142220");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
