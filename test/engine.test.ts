import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { FlameBornEngine, FlameBornEngine__factory } from "../typechain-types";
import { IFlameBornToken, IHealthIDNFT } from "../typechain-types";

describe("FlameBornEngine", function () {
  let engine: FlameBornEngine;
  let token: IFlameBornToken;
  let healthIDNFT: IHealthIDNFT;
  let admin: string;
  let user1: string;
  let user2: string;

  before(async () => {
    [admin, user1, user2] = await ethers.getSigners();
    
    // Deploy mock tokens
    const TokenFactory = await ethers.getContractFactory("FlameBornToken");
    token = await TokenFactory.deploy();
    
    const NFTFactory = await ethers.getContractFactory("HealthIDNFT");
    healthIDNFT = await NFTFactory.deploy();
    
    // Deploy engine
    const EngineFactory = await ethers.getContractFactory("FlameBornEngine");
    engine = await upgrades.deployProxy(EngineFactory, [
      admin.address,
      token.address,
      healthIDNFT.address,
      ethers.utils.parseEther("1"), // actorReward
      1000 // donationRewardRate
    ]) as FlameBornEngine;
  });

  it("Should initialize with correct parameters", async () => {
    expect(await engine.token()).to.equal(token.address);
    expect(await engine.healthIDNFT()).to.equal(healthIDNFT.address);
    expect(await engine.actorReward()).to.equal(ethers.utils.parseEther("1"));
    expect(await engine.donationRewardRate()).to.equal(1000);
  });

  it("Should allow donations and distribute rewards", async () => {
    const donationAmount = ethers.utils.parseEther("0.1");
    
    // Mock user donating
    await expect(
      engine.connect(user1).donate({ value: donationAmount })
    ).to.changeEtherBalances(
      [user1, engine],
      [donationAmount.mul(-1), donationAmount]
    );
    
    // Verify rewards calculation
    const expectedReward = donationAmount.div(1000);
    expect(await engine.calculateReward(user1.address)).to.equal(expectedReward);
  });

  it("Should enforce role-based access control", async () => {
    // Non-admin shouldn't be able to withdraw
    await expect(
      engine.connect(user1).withdrawDonations(user1.address)
    ).to.be.revertedWith(/AccessControl/);
    
    // Admin should be able to withdraw
    await expect(
      engine.connect(admin).withdrawDonations(admin.address)
    ).to.changeEtherBalances(
      [engine, admin],
      [donationAmount.mul(-1), donationAmount]
    );
  });

  it("Should support contract upgrades", async () => {
    const EngineV2Factory = await ethers.getContractFactory("FlameBornEngineV2");
    const engineV2 = await upgrades.upgradeProxy(
      engine.address,
      EngineV2Factory
    ) as FlameBornEngine;
    
    // Verify state is preserved
    expect(await engineV2.token()).to.equal(token.address);
    expect(await engineV2.healthIDNFT()).to.equal(healthIDNFT.address);
  });
});
