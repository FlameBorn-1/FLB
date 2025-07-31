import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { 
  FlameBornEngine, 
  FlameBornEngine__factory,
  FLBTokenMock,
  FLBTokenMock__factory,
  HealthIDNFTMock,
  HealthIDNFTMock__factory 
} from "../typechain-types";

describe("FlameBornEngine", function () {
  let engine: FlameBornEngine;
  let flbToken: FLBTokenMock;
  let healthIDNFT: HealthIDNFTMock;

  let admin: any;
  let registrar: any;
  let donor: any;
  let questAdmin: any;
  let actor: any;

  beforeEach(async () => {
    [admin, registrar, donor, questAdmin, actor] = await ethers.getSigners();

    const FLBTokenFactory = await ethers.getContractFactory("FLBTokenMock");
    flbToken = await FLBTokenFactory.deploy();

    const NFTFactory = await ethers.getContractFactory("HealthIDNFTMock");
    healthIDNFT = await NFTFactory.deploy();

    const EngineFactory = await ethers.getContractFactory("FlameBornEngine");
    engine = await upgrades.deployProxy(EngineFactory, [
      admin.address,
      await flbToken.getAddress(),
      await healthIDNFT.getAddress(),
      ethers.parseEther("100"),
      100 // rewardRate: 1 ETH = 100 FLB
    ], {
      initializer: "initialize",
      kind: "uups"
    }) as FlameBornEngine;

    // Setup roles
    await engine.connect(admin).grantRole(await engine.REGISTRAR_ROLE(), registrar.address);
    await engine.connect(admin).grantRole(await engine.QUEST_ADMIN_ROLE(), questAdmin.address);

    // Let the engine mint FLB
    await flbToken.setMinter(await engine.getAddress());
  });

  it("should verify an actor and mint NFT + FLB", async () => {
    await engine.connect(registrar).verifyActor(
      actor.address,
      1, // Doctor
      "Dr. Flame",
      "LICENSE123",
      "+123456789"
    );

    const isVerified = await engine.isVerifiedActor(actor.address);
    expect(isVerified).to.be.true;

    const flbBalance = await flbToken.balanceOf(actor.address);
    expect(flbBalance).to.equal(ethers.parseEther("100"));
  });

  it("should accept donation and reward FLB", async () => {
    await engine.connect(donor).donate({ value: ethers.parseEther("1") });

    const donorBalance = await flbToken.balanceOf(donor.address);
    expect(donorBalance).to.equal(ethers.parseEther("100"));

    const donationRecord = await engine.donorBalances(donor.address);
    expect(donationRecord).to.equal(ethers.parseEther("1"));
  });

  it("should award quest tokens to user", async () => {
    await engine.connect(questAdmin).awardQuest(donor.address, ethers.parseEther("50"), "QST-001");

    const flbBalance = await flbToken.balanceOf(donor.address);
    expect(flbBalance).to.equal(ethers.parseEther("50"));

    const rewardStats = await engine.questRewards(donor.address);
    expect(rewardStats).to.equal(ethers.parseEther("50"));
  });

  it("should allow admin to withdraw donated ETH", async () => {
    await engine.connect(donor).donate({ value: ethers.parseEther("1") });

    const adminStart = await ethers.provider.getBalance(admin.address);
    const tx = await engine.connect(admin).withdrawDonations(admin.address);
    const receipt = await tx.wait();

    const adminEnd = await ethers.provider.getBalance(admin.address);
    expect(adminEnd).to.be.greaterThan(adminStart); // Allowing gas variation
  });

  it("should enforce role-based access control", async () => {
    // Non-registrar shouldn't be able to verify actors
    await expect(
      engine.connect(donor).verifyActor(
        actor.address,
        1, // Doctor
        "Dr. Flame",
        "LICENSE123",
        "+123456789"
      )
    ).to.be.revertedWithCustomError(engine, "AccessControlUnauthorizedAccount");

    // Non-quest admin shouldn't be able to award quests
    await expect(
      engine.connect(donor).awardQuest(donor.address, ethers.parseEther("50"), "QST-001")
    ).to.be.revertedWithCustomError(engine, "AccessControlUnauthorizedAccount");

    // Non-admin shouldn't be able to withdraw
    await expect(
      engine.connect(donor).withdrawDonations(donor.address)
    ).to.be.revertedWithCustomError(engine, "AccessControlUnauthorizedAccount");
  });
});
