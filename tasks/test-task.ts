import { task } from "hardhat/config";

task("test-task", "A test task to verify Hardhat is working").setAction(
  async (taskArgs, hre) => {
    console.log("✅ Hardhat is working correctly!");
    console.log("Network name:", hre.network.name);
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer address:", deployer.address);
  }
);
