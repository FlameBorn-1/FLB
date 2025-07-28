import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { FlamebornEngine, TestContract } from "../typechain-types";

describe("FlamebornEngine: Unit Tests", function () {
  let deployer: Signer;
  let flamebornEngine: FlamebornEngine;
  let mockToken: TestContract;
  let mockNFT: TestContract;

  // Replicating the enum from the contract for type safety in tests
  const ActorRole = {
    Unset: 0,
    Doctor: 1,
    Nurse: 2,
    Clinic: 3,
    OutreachTeam: 4,
    CommunityHealthWorker: 5,
  };

  beforeEach(async function () {
    [deployer] = await ethers.getSigners();

    // The FlamebornEngine constructor requires addresses for other contracts.
    // We can deploy a simple TestContract to get valid addresses for mocking.
    const TestContractFactory = await ethers.getContractFactory("TestContract");
    mockToken = await TestContractFactory.deploy();
    mockNFT = await TestContractFactory.deploy();
    await mockToken.waitForDeployment();
    await mockNFT.waitForDeployment();

    const mockTokenAddress = await mockToken.getAddress();
    const mockNFTAddress = await mockNFT.getAddress();
    const deployerAddress = await deployer.getAddress();

    // Deploy the main FlamebornEngine contract
    // Note: Using "FlamebornEngine" to match the compiled artifact name.
    const FlamebornEngineFactory = await ethers.getContractFactory("FlamebornEngine");
    flamebornEngine = await FlamebornEngineFactory.deploy(
      deployerAddress,
      mockTokenAddress,
      mockNFTAddress,
      ethers.parseUnits("100", 18), // _actorReward
      100 // _donationRewardRate
    );
    await flamebornEngine.waitForDeployment();
  });

  describe("tokenURIForActor()", function () {
    it("should correctly format the token URI with a standard name", async function () {
      const role = ActorRole.Doctor;
      const name = "Dr.Alice";
      const expectedURI = "https://example.com/metadata/Dr.Alice";

      const result = await flamebornEngine.tokenURIForActor(role, name);
      expect(result).to.equal(expectedURI);
    });

    it("should return the same URI regardless of the actor role, as per current implementation", async function () {
      const name = "TestClinic";
      const uriForDoctor = await flamebornEngine.tokenURIForActor(ActorRole.Doctor, name);
      const uriForClinic = await flamebornEngine.tokenURIForActor(ActorRole.Clinic, name);

      const expectedURI = `https://example.com/metadata/${name}`;
      expect(uriForDoctor).to.equal(expectedURI);
      expect(uriForClinic).to.equal(expectedURI);
    });

    it("should handle an empty string for the name", async function () {
      const role = ActorRole.Nurse;
      const name = "";
      const expectedURI = "https://example.com/metadata/";

      const result = await flamebornEngine.tokenURIForActor(role, name);
      expect(result).to.equal(expectedURI);
    });

    it("should handle names with spaces and special characters", async function () {
      const role = ActorRole.CommunityHealthWorker;
      const name = "CHW John Doe #123";
      const expectedURI = "https://example.com/metadata/CHW John Doe #123";

      const result = await flamebornEngine.tokenURIForActor(role, name);
      expect(result).to.equal(expectedURI);
    });
  });
});