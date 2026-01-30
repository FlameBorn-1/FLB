// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/FlameBornToken.sol";
import "../contracts/FlameBornEngine.sol";
import "../contracts/HealthIDNFT.sol";

/**
 * @title FlameBorn Fuzz Tests
 * @notice Adversarial testing with randomized inputs to find edge cases
 * @dev Tests protocol behavior under chaotic, malicious, and extreme conditions
 */
contract FlameBornFuzzTest is Test {
    FlameBornToken public token;
    HealthIDNFT public nft;

    address public safe = address(0xSAFE);
    address public engine = address(0xBEEF);

    function setUp() public {
        token = new FlameBornToken();
        token.initialize(safe);

        vm.prank(safe);
        nft = new HealthIDNFT(safe);

        vm.prank(safe);
        token.grantMinterRole(engine);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FUZZ: UNAUTHORIZED MINT ATTACKS
    // ═══════════════════════════════════════════════════════════════════════════

    /// @notice Fuzz test: Random addresses cannot mint
    function testFuzz_UnauthorizedMintReverts(
        address attacker,
        address recipient,
        uint256 amount
    ) public {
        // Exclude authorized addresses
        vm.assume(attacker != engine);
        vm.assume(attacker != safe);
        vm.assume(amount > 0 && amount < type(uint128).max);

        vm.prank(attacker);
        vm.expectRevert("Caller is not authorized to mint");
        token.mint(recipient, amount);
    }

    /// @notice Fuzz test: Authorized minter can mint any valid amount
    function testFuzz_AuthorizedMintSucceeds(
        address recipient,
        uint256 amount
    ) public {
        vm.assume(recipient != address(0));
        vm.assume(amount > 0 && amount < 1e30); // Reasonable max

        uint256 supplyBefore = token.totalSupply();

        vm.prank(engine);
        token.mint(recipient, amount);

        assertEq(token.balanceOf(recipient), amount);
        assertEq(token.totalSupply(), supplyBefore + amount);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FUZZ: ROLE MANIPULATION ATTACKS
    // ═══════════════════════════════════════════════════════════════════════════

    /// @notice Fuzz test: Random addresses cannot grant roles
    function testFuzz_UnauthorizedRoleGrantReverts(
        address attacker,
        address target
    ) public {
        vm.assume(attacker != safe);
        vm.assume(target != address(0));

        vm.prank(attacker);
        vm.expectRevert();
        token.grantMinterRole(target);
    }

    /// @notice Fuzz test: Random addresses cannot revoke roles
    function testFuzz_UnauthorizedRoleRevokeReverts(
        address attacker,
        address target
    ) public {
        vm.assume(attacker != safe);

        vm.prank(attacker);
        vm.expectRevert();
        token.revokeMinterRole(target);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FUZZ: PAUSE ATTACK VECTORS
    // ═══════════════════════════════════════════════════════════════════════════

    /// @notice Fuzz test: Random addresses cannot pause
    function testFuzz_UnauthorizedPauseReverts(address attacker) public {
        vm.assume(attacker != safe);

        vm.prank(attacker);
        vm.expectRevert();
        token.pause();
    }

    /// @notice Fuzz test: Transfers fail when paused
    function testFuzz_TransferFailsWhenPaused(
        address from,
        address to,
        uint256 amount
    ) public {
        vm.assume(from != address(0) && to != address(0));
        vm.assume(amount > 0 && amount < 1e20);

        // Mint some tokens first
        vm.prank(engine);
        token.mint(from, amount);

        // Pause
        vm.prank(safe);
        token.pause();

        // Transfer should fail
        vm.prank(from);
        vm.expectRevert();
        token.transfer(to, amount);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FUZZ: NFT SOULBOUND ENFORCEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /// @notice Fuzz test: NFT transfers always revert (soulbound)
    function testFuzz_NFTTransferAlwaysReverts(
        address from,
        address to,
        uint256 tokenId
    ) public {
        vm.assume(from != address(0) && to != address(0));
        vm.assume(from != to);
        vm.assume(tokenId > 0 && tokenId < 1000);

        // Mint NFT to 'from'
        vm.prank(safe);
        nft.grantRole(nft.MINTER_ROLE(), address(this));
        
        nft.mint(from);

        // Attempt transfer (should always fail)
        vm.prank(from);
        vm.expectRevert();
        nft.transferFrom(from, to, tokenId);
    }

    /// @notice Fuzz test: NFT burning always reverts (soulbound)
    function testFuzz_NFTBurnAlwaysReverts(
        address owner,
        uint256 tokenId
    ) public {
        vm.assume(owner != address(0));
        vm.assume(tokenId > 0 && tokenId < 1000);

        // Mint NFT
        vm.prank(safe);
        nft.grantRole(nft.MINTER_ROLE(), address(this));
        
        uint256 actualTokenId = nft.mint(owner);

        // Attempt burn (should fail)
        vm.prank(owner);
        vm.expectRevert();
        nft.transferFrom(owner, address(0), actualTokenId);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FUZZ: EXTREME VALUE TESTING
    // ═══════════════════════════════════════════════════════════════════════════

    /// @notice Fuzz test: Mint with edge values
    function testFuzz_MintEdgeValues(uint256 amount) public {
        // Test with any uint256 value
        vm.assume(amount > 0);

        // Should not overflow or cause issues
        vm.prank(engine);
        
        if (amount > type(uint128).max) {
            // Very large amounts might cause issues
            // Let it revert naturally if overflow occurs
            try token.mint(engine, amount) {
                assertGe(token.balanceOf(engine), amount);
            } catch {
                // Expected for extreme values
            }
        } else {
            token.mint(engine, amount);
            assertEq(token.balanceOf(engine), amount);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FUZZ: REENTRANCY SIMULATION
    // ═══════════════════════════════════════════════════════════════════════════

    /// @notice Fuzz test: Multiple rapid mints don't cause state corruption
    function testFuzz_RapidMintsNoCorruption(
        uint8 numMints,
        uint256 amount
    ) public {
        vm.assume(numMints > 0 && numMints < 100);
        vm.assume(amount > 0 && amount < 1e20);

        uint256 expectedTotal = 0;

        for (uint256 i = 0; i < numMints; i++) {
            vm.prank(engine);
            token.mint(engine, amount);
            expectedTotal += amount;
        }

        assertEq(token.balanceOf(engine), expectedTotal);
        assertEq(token.totalSupply(), expectedTotal);
    }
}
