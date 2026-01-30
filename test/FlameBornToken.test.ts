import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { FlameBornToken, HealthIDNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FlameBornToken - Security & Stress Tests", function () {
    let token: FlameBornToken;
    let nft: HealthIDNFT;
    let owner: SignerWithAddress;
    let safe: SignerWithAddress;
    let engine: SignerWithAddress;
    let attacker: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

    beforeEach(async function () {
        [owner, safe, engine, attacker, user1, user2] = await ethers.getSigners();

        // Deploy Token
        const TokenFactory = await ethers.getContractFactory("FlameBornToken");
        token = await upgrades.deployProxy(
            TokenFactory,
            [owner.address],
            { initializer: "initialize" }
        ) as unknown as FlameBornToken;

        // Deploy NFT
        const NFTFactory = await ethers.getContractFactory("HealthIDNFT");
        nft = await NFTFactory.deploy(owner.address) as HealthIDNFT;

        // Grant MINTER_ROLE to engine
        await token.grantMinterRole(engine.address);
        await nft.grantRole(MINTER_ROLE, engine.address);
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // CRITICAL: MINT AUTHORITY TESTS
    // ═══════════════════════════════════════════════════════════════════════════

    describe("🔴 CRITICAL: Mint Authority", function () {
        it("Should start with zero total supply", async function () {
            expect(await token.totalSupply()).to.equal(0);
        });

        it("Should revert when non-minter tries to mint", async function () {
            await expect(
                token.connect(attacker).mint(attacker.address, ethers.parseUnits("100", 18))
            ).to.be.revertedWith("Caller is not authorized to mint");
        });

        it("Should allow minter to mint", async function () {
            const amount = ethers.parseUnits("100", 18);
            await token.connect(engine).mint(user1.address, amount);
            expect(await token.balanceOf(user1.address)).to.equal(amount);
        });

        it("Should prevent owner from minting without MINTER_ROLE", async function () {
            await expect(
                token.connect(owner).mint(owner.address, ethers.parseUnits("100", 18))
            ).to.be.revertedWith("Caller is not authorized to mint");
        });

        it("Should handle multiple rapid mints without corruption", async function () {
            const amount = ethers.parseUnits("10", 18);
            const numMints = 50;

            for (let i = 0; i < numMints; i++) {
                await token.connect(engine).mint(user1.address, amount);
            }

            const expectedTotal = amount * BigInt(numMints);
            expect(await token.balanceOf(user1.address)).to.equal(expectedTotal);
            expect(await token.totalSupply()).to.equal(expectedTotal);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // CRITICAL: ROLE SAFETY TESTS
    // ═══════════════════════════════════════════════════════════════════════════

    describe("🔴 CRITICAL: Role Safety", function () {
        it("Should have DEFAULT_ADMIN_ROLE assigned to owner", async function () {
            expect(await token.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should have MINTER_ROLE assigned to engine", async function () {
            expect(await token.hasRole(MINTER_ROLE, engine.address)).to.be.true;
        });

        it("Should prevent non-owner from granting MINTER_ROLE", async function () {
            await expect(
                token.connect(attacker).grantMinterRole(attacker.address)
            ).to.be.reverted;
        });

        it("Should allow owner to grant MINTER_ROLE", async function () {
            await token.connect(owner).grantMinterRole(user1.address);
            expect(await token.hasRole(MINTER_ROLE, user1.address)).to.be.true;
        });

        it("Should allow owner to revoke MINTER_ROLE", async function () {
            await token.connect(owner).revokeMinterRole(engine.address);
            expect(await token.hasRole(MINTER_ROLE, engine.address)).to.be.false;
        });

        it("Should prevent minting after role revocation", async function () {
            await token.connect(owner).revokeMinterRole(engine.address);

            await expect(
                token.connect(engine).mint(user1.address, ethers.parseUnits("100", 18))
            ).to.be.revertedWith("Caller is not authorized to mint");
        });

        it("Should never have zero admin (owner always exists)", async function () {
            expect(await token.owner()).to.not.equal(ethers.ZeroAddress);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // CRITICAL: PAUSE FUNCTIONALITY
    // ═══════════════════════════════════════════════════════════════════════════

    describe("🔴 CRITICAL: Pause Functionality", function () {
        it("Should allow owner to pause", async function () {
            await token.connect(owner).pause();
            expect(await token.paused()).to.be.true;
        });

        it("Should prevent non-owner from pausing", async function () {
            await expect(
                token.connect(attacker).pause()
            ).to.be.reverted;
        });

        it("Should block transfers when paused", async function () {
            // Mint some tokens first
            await token.connect(engine).mint(user1.address, ethers.parseUnits("100", 18));

            // Pause
            await token.connect(owner).pause();

            // Transfer should fail
            await expect(
                token.connect(user1).transfer(user2.address, ethers.parseUnits("10", 18))
            ).to.be.reverted;
        });

        it("Should allow transfers after unpause", async function () {
            // Mint and pause
            await token.connect(engine).mint(user1.address, ethers.parseUnits("100", 18));
            await token.connect(owner).pause();

            // Unpause
            await token.connect(owner).unpause();

            // Transfer should succeed
            await token.connect(user1).transfer(user2.address, ethers.parseUnits("10", 18));
            expect(await token.balanceOf(user2.address)).to.equal(ethers.parseUnits("10", 18));
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // CRITICAL: UPGRADE SAFETY
    // ═══════════════════════════════════════════════════════════════════════════

    describe("🔴 CRITICAL: Upgrade Safety", function () {
        it("Should prevent non-owner from upgrading", async function () {
            const TokenV2Factory = await ethers.getContractFactory("FlameBornToken", attacker);

            await expect(
                upgrades.upgradeProxy(await token.getAddress(), TokenV2Factory)
            ).to.be.reverted;
        });

        it("Should preserve state after upgrade", async function () {
            // Mint some tokens
            const amount = ethers.parseUnits("1000", 18);
            await token.connect(engine).mint(user1.address, amount);

            const supplyBefore = await token.totalSupply();
            const balanceBefore = await token.balanceOf(user1.address);

            // Upgrade (using same implementation for test)
            const TokenV2Factory = await ethers.getContractFactory("FlameBornToken", owner);
            const upgraded = await upgrades.upgradeProxy(await token.getAddress(), TokenV2Factory);

            // Verify state preserved
            expect(await upgraded.totalSupply()).to.equal(supplyBefore);
            expect(await upgraded.balanceOf(user1.address)).to.equal(balanceBefore);
            expect(await upgraded.hasRole(MINTER_ROLE, engine.address)).to.be.true;
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // CRITICAL: SOULBOUND NFT TESTS
    // ═══════════════════════════════════════════════════════════════════════════

    describe("🔴 CRITICAL: Soulbound NFT Enforcement", function () {
        it("Should mint NFT successfully", async function () {
            await nft.connect(engine).mint(user1.address);
            expect(await nft.balanceOf(user1.address)).to.equal(1);
        });

        it("Should prevent NFT transfers", async function () {
            const tokenId = await nft.connect(engine).mint.staticCall(user1.address);
            await nft.connect(engine).mint(user1.address);

            await expect(
                nft.connect(user1).transferFrom(user1.address, user2.address, tokenId)
            ).to.be.revertedWithCustomError(nft, "SoulboundTransferNotAllowed");
        });

        it("Should prevent NFT burning", async function () {
            const tokenId = await nft.connect(engine).mint.staticCall(user1.address);
            await nft.connect(engine).mint(user1.address);

            await expect(
                nft.connect(user1).transferFrom(user1.address, ethers.ZeroAddress, tokenId)
            ).to.be.revertedWithCustomError(nft, "SoulboundTransferNotAllowed");
        });

        it("Should prevent approval (soulbound)", async function () {
            const tokenId = await nft.connect(engine).mint.staticCall(user1.address);
            await nft.connect(engine).mint(user1.address);

            await expect(
                nft.connect(user1).approve(user2.address, tokenId)
            ).to.be.reverted;
        });

        it("Should prevent setApprovalForAll (soulbound)", async function () {
            await nft.connect(engine).mint(user1.address);

            await expect(
                nft.connect(user1).setApprovalForAll(user2.address, true)
            ).to.be.reverted;
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // HIGH: EDGE CASES & EXTREME VALUES
    // ═══════════════════════════════════════════════════════════════════════════

    describe("🟡 HIGH: Edge Cases", function () {
        it("Should handle minting to zero address gracefully", async function () {
            await expect(
                token.connect(engine).mint(ethers.ZeroAddress, ethers.parseUnits("100", 18))
            ).to.be.reverted;
        });

        it("Should handle minting zero amount", async function () {
            await token.connect(engine).mint(user1.address, 0);
            expect(await token.balanceOf(user1.address)).to.equal(0);
        });

        it("Should handle very large mint amounts", async function () {
            const largeAmount = ethers.parseUnits("1000000000", 18); // 1 billion tokens
            await token.connect(engine).mint(user1.address, largeAmount);
            expect(await token.balanceOf(user1.address)).to.equal(largeAmount);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // INVARIANT CHECKS
    // ═══════════════════════════════════════════════════════════════════════════

    describe("🔒 INVARIANTS", function () {
        it("INVARIANT: Total supply equals sum of balances", async function () {
            await token.connect(engine).mint(user1.address, ethers.parseUnits("100", 18));
            await token.connect(engine).mint(user2.address, ethers.parseUnits("200", 18));

            const balance1 = await token.balanceOf(user1.address);
            const balance2 = await token.balanceOf(user2.address);
            const totalSupply = await token.totalSupply();

            expect(totalSupply).to.equal(balance1 + balance2);
        });

        it("INVARIANT: Supply is monotonically increasing", async function () {
            const supply1 = await token.totalSupply();

            await token.connect(engine).mint(user1.address, ethers.parseUnits("100", 18));
            const supply2 = await token.totalSupply();

            await token.connect(engine).mint(user2.address, ethers.parseUnits("50", 18));
            const supply3 = await token.totalSupply();

            expect(supply2).to.be.greaterThan(supply1);
            expect(supply3).to.be.greaterThan(supply2);
        });

        it("INVARIANT: NFT supply is monotonically increasing (no burns)", async function () {
            const supply1 = await nft.totalSupply();

            await nft.connect(engine).mint(user1.address);
            const supply2 = await nft.totalSupply();

            await nft.connect(engine).mint(user2.address);
            const supply3 = await nft.totalSupply();

            expect(supply2).to.be.greaterThan(supply1);
            expect(supply3).to.be.greaterThan(supply2);
        });
    });
});
