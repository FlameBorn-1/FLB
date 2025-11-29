import { ethers, upgrades } from "hardhat";
import fs from "fs";

async function main() {
  const network = await ethers.provider.getNetwork();
  const deployer = (await ethers.getSigners())[0];
  console.log(`Deploying FlameBornToken to ${network.name} as ${deployer.address}`);

  const filePath = `deployments/${network.name}.json`;
  const deployment = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf8"))
    : { network: network.name, chainId: Number(network.chainId) };

  if (deployment.FlameBornToken?.proxy) {
    console.log("FlameBornToken already deployed at", deployment.FlameBornToken.proxy);
    return;
  }

  const Token = await ethers.getContractFactory("FlameBornToken");
  const proxy = await upgrades.deployProxy(Token, [deployer.address], {
    initializer: "initialize",
    kind: "uups"
  });
  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  deployment.FlameBornToken = {
    proxy: proxyAddress,
    implementation: implementationAddress,
    version: "1.0.0"
  };

  fs.writeFileSync(filePath, JSON.stringify(deployment, null, 2));

  console.log("Proxy:", proxyAddress);
  console.log("Implementation:", implementationAddress);
  console.log("Deployment info saved to", filePath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
