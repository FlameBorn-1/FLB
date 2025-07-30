// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
 * FlameBornEngine is a unified contract that combines registry, donation, and
 * learn‑to‑earn functionality.  Instead of scattering responsibilities across
 * multiple contracts (DonationRouter, LearnToEarn, FLBVesting, etc.), this
 * contract centralizes FLB minting and burning, actor registration, and
 * donation handling.  Actors such as doctors, nurses or clinics can be
 * verified by a registrar and receive a soul‑bound credential NFT as well as
 * a token reward.  Users can donate ETH to support health services and will
 * receive FLB tokens in return.  Quest administrators can award FLB
 * incentives for completing learn‑to‑earn activities.
 */

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Minimal interface for the FLB token.  The FLB token should expose a
 * mint function for rewarding users.  If your implementation uses a role
 * restricted mint function, be sure to grant this contract permission.
 */
interface IFlameBornToken is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(address account, uint256 amount) external;
}

/**
 * @dev Minimal interface for the soul‑bound credential NFT.  The registry
 * uses this to mint credentials for verified health actors.  The NFT
 * implementation itself should enforce non‑transferability and other SBT
 * semantics.
 */
interface IHealthIDNFT {
    function mintCredential(address to, uint256 tokenId, string calldata uri) external;
}

contract FlamebornEngine is AccessControl {
    using Address for address payable;

    // -------------------------------------------------------------------------
    // Roles
    //
    // DEFAULT_ADMIN_ROLE: overall admin; can withdraw ETH and manage roles.
    // REGISTRAR_ROLE: allowed to verify health actors.
    // QUEST_ADMIN_ROLE: allowed to award tokens for learn‑to‑earn quests.
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant QUEST_ADMIN_ROLE = keccak256("QUEST_ADMIN_ROLE");

    // -------------------------------------------------------------------------
    // Structs

    /**
     * @dev The Role enum represents the type of health actor.  Additional
     * categories can be appended as needed (e.g., pharmacist, outreach team).
     */
    enum ActorRole {
        Unset,
        Doctor,
        Nurse,
        Clinic,
        OutreachTeam,
        CommunityHealthWorker
    }

    /**
     * @dev Metadata for each verified actor.
     */
    struct Actor {
        bool verified;
        ActorRole role;
        string name;
        string licenseId;
        string phone;
    }

    // -------------------------------------------------------------------------
    // State variables

    /// @dev The ERC‑20 FLB token used for all rewards and donations.
    IFlameBornToken public immutable token;

    /// @dev The soul‑bound credential NFT contract.  Verified actors
    /// receive a credential when they are registered.
    IHealthIDNFT public immutable credentialNFT;

    /// @dev Reward amount in FLB paid out when a health actor is verified.
    uint256 public immutable actorReward;

    /// @dev Reward rate for ETH donations.  For example, if the rate is
    /// 100, donating 1 ETH will mint 100 FLB.
    uint256 public immutable donationRewardRate;

    /// @dev Mapping from user address to cumulative amount of ETH donated.
    mapping(address => uint256) public donorBalances;

    /// @dev Total ETH donated through the engine.
    uint256 public totalDonations;

    /// @dev Storage for verified actors.  Only verified actors have
    /// meaningful metadata; unverified entries will have `verified` false.
    mapping(address => Actor) public actors;

    /// @dev Tracks the total FLB tokens awarded via quests per user.  This can
    /// be used for analytics or limiting quest rewards.  Not strictly
    /// necessary but useful for front‑ends.
    mapping(address => uint256) public questRewards;

    // -------------------------------------------------------------------------
    // Events

    event DonationReceived(address indexed donor, uint256 amountETH, uint256 rewardFLB);
    event ActorVerified(address indexed actor, ActorRole role, string name);
    event QuestRewarded(address indexed user, string questId, uint256 reward);

    // -------------------------------------------------------------------------
    // Constructor

    /**
     * @param admin The address that will receive DEFAULT_ADMIN_ROLE and
     * REGISTRAR_ROLE and QUEST_ADMIN_ROLE by default.  Make sure this is a
     * multisig or a well‑secured address.
     * @param _token The FLB token contract.
     * @param _credentialNFT The soul‑bound credential NFT contract.
     * @param _actorReward The amount of FLB minted when a health actor is verified.
     * @param _donationRewardRate The conversion rate from ETH to FLB when donating.
     */
    constructor(
        address admin,
        IFlameBornToken _token,
        IHealthIDNFT _credentialNFT,
        uint256 _actorReward,
        uint256 _donationRewardRate
    ) {
        require(admin != address(0), "Admin address required");
        require(address(_token) != address(0), "Token address required");
        require(address(_credentialNFT) != address(0), "Credential NFT required");
        require(_donationRewardRate > 0, "Donation reward rate must be > 0");

        token = _token;
        credentialNFT = _credentialNFT;
        actorReward = _actorReward;
        donationRewardRate = _donationRewardRate;

        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
        _grantRole(QUEST_ADMIN_ROLE, admin);
    }

    // -------------------------------------------------------------------------
    // Donation logic

    /**
     * @notice Donate ETH to support health services.  Donors receive FLB
     * tokens in return.  Donations accumulate in the contract and can be
     * withdrawn by the admin.  This replaces the separate DonationRouter.
     */
    function donate() external payable {
        require(msg.value > 0, "Donation must be greater than 0");

        totalDonations += msg.value;
        donorBalances[msg.sender] += msg.value;

        // Calculate FLB reward: msg.value (in wei) * rate.  Since both
        // quantities are integers, this will produce a large number for
        // small donations.  Consider scaling your rate down to match token
        // decimals if necessary.
        uint256 reward = msg.value * donationRewardRate;
        token.mint(msg.sender, reward);

        emit DonationReceived(msg.sender, msg.value, reward);
    }

    /**
     * @notice Withdraw accumulated ETH donations.  Only callable by the
     * DEFAULT_ADMIN_ROLE.  Sending ETH via `sendValue` ensures proper gas
     * forwarding.
     */
    function withdrawDonations(address payable recipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available");
        require(recipient != address(0), "Recipient required");
        recipient.sendValue(balance);
    }

    // -------------------------------------------------------------------------
    // Actor verification logic

    /**
     * @notice Verify and register a health actor.  Mints a soul‑bound
     * credential NFT to the actor and mints FLB reward tokens.  Only
     * accounts with REGISTRAR_ROLE may call this.
     */
    function verifyActor(
        address actorAddress,
        ActorRole role,
        string calldata name,
        string calldata licenseId,
        string calldata phone
    ) external onlyRole(REGISTRAR_ROLE) {
        require(actorAddress != address(0), "Invalid actor address");

        actors[actorAddress] = Actor({
            verified: true,
            role: role,
            name: name,
            licenseId: licenseId,
            phone: phone
        });

        // Mint a soul‑bound credential.  Use the actor address as the tokenId
        // to ensure uniqueness.  The metadata URI can be computed off‑chain
        // (e.g., IPFS) and passed here; for simplicity we derive from name.
        string memory uri = tokenURIForActor(name);
        credentialNFT.mintCredential(actorAddress, uint256(uint160(actorAddress)), uri);

        // Mint FLB reward
        token.mint(actorAddress, actorReward);

        emit ActorVerified(actorAddress, role, name);
    }

    /**
     * @notice Generate a simple token URI for an actor based on their role and name.
     * In production, this should point to real metadata hosted on IPFS or
     * another decentralised storage.
     */
    function tokenURIForActor(string memory name) public pure returns (string memory) {
        // Example: prepend role as string.  You may replace this with IPFS CID.
        return string(abi.encodePacked("https://example.com/metadata/", name));
    }

    // -------------------------------------------------------------------------
    // Learn‑to‑Earn / Quest logic

    /**
     * @notice Award FLB tokens to a user for completing a quest or lesson.
     * This centralises the learn‑to‑earn logic that would otherwise live in
     * a separate LearnToEarn contract.  Only QUEST_ADMIN_ROLE holders may
     * call this function.  You may add additional parameters (like a quest
     * identifier) to track progress off‑chain.
     *
     * @param user The address receiving the reward.
     * @param reward The amount of FLB to mint.  Ensure this aligns with
     *               your tokenomics and multiplier policies.
     * @param questId An arbitrary identifier for the quest, used for event
     *                tracking and front‑end display.
     */
    function awardQuest(address user, uint256 reward, string calldata questId) external onlyRole(QUEST_ADMIN_ROLE) {
        require(user != address(0), "Invalid user");
        require(reward > 0, "Reward must be > 0");

        questRewards[user] += reward;
        token.mint(user, reward);

        emit QuestRewarded(user, questId, reward);
    }

    // -------------------------------------------------------------------------
    // View helpers

    /**
     * @notice Returns whether an address is a verified actor.
     */
    function isVerifiedActor(address actor) external view returns (bool) {
        return actors[actor].verified;
    }

    /**
     * @notice Returns a tuple of actor metadata.  If the actor is not
     * verified, all fields will be default values.
     */
    function getActor(address actor) external view returns (bool verified, ActorRole role, string memory name, string memory licenseId, string memory phone) {
        Actor memory a = actors[actor];
        return (a.verified, a.role, a.name, a.licenseId, a.phone);
    }
}