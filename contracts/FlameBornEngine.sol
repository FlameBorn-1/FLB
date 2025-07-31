// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFlameBornToken is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(address account, uint256 amount) external;
}

interface IHealthIDNFT {
    function mintCredential(address to, uint256 tokenId, string calldata uri) external;
}

contract FlameBornEngine is Initializable, UUPSUpgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable {

    // Roles
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant QUEST_ADMIN_ROLE = keccak256("QUEST_ADMIN_ROLE");

    // Actor types
    enum ActorRole {
        Unset,
        Doctor,
        Nurse,
        Clinic,
        OutreachTeam,
        CommunityHealthWorker
    }

    struct Actor {
        bool verified;
        ActorRole role;
        string name;
        string licenseId;
        string phone;
    }

    IFlameBornToken public token;
    IHealthIDNFT public healthIDNFT;
    uint256 public actorReward;
    uint256 public donationRewardRate;
    uint256 public totalDonations;

    mapping(address => uint256) public donorBalances;
    mapping(address => Actor) public actors;
    mapping(address => uint256) public questRewards;

    event DonationReceived(address indexed donor, uint256 amountETH, uint256 rewardFLB);
    event ActorVerified(address indexed actor, ActorRole role, string name);
    event QuestRewarded(address indexed user, string questId, uint256 reward);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address admin,
        address _token,
        address _healthIDNFT,
        uint256 _actorReward,
        uint256 _donationRewardRate
    ) public initializer {
        require(admin != address(0), "Admin required");
        require(_token != address(0), "Token required");
        require(_healthIDNFT != address(0), "HealthIDNFT required");

        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        token = IFlameBornToken(_token);
        healthIDNFT = IHealthIDNFT(_healthIDNFT);
        actorReward = _actorReward;
        donationRewardRate = _donationRewardRate;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
        _grantRole(QUEST_ADMIN_ROLE, admin);
    }

    function donate() external payable {
        require(msg.value > 0, "Donation must be greater than 0");

        totalDonations += msg.value;
        donorBalances[msg.sender] += msg.value;

        uint256 reward = msg.value * donationRewardRate;
        token.mint(msg.sender, reward);

        emit DonationReceived(msg.sender, msg.value, reward);
    }

    function withdrawDonations(address payable recipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available");
        require(recipient != address(0), "Recipient required");
        (bool success, ) = recipient.call{value: balance}("");
        require(success, "Transfer failed");
    }

    function verifyActor(
        address actorAddress,
        ActorRole role,
        string calldata name,
        string calldata licenseId,
        string calldata phone
    ) external onlyRole(REGISTRAR_ROLE) {
        require(actorAddress != address(0), "Invalid actor");

        actors[actorAddress] = Actor({
            verified: true,
            role: role,
            name: name,
            licenseId: licenseId,
            phone: phone
        });

        string memory uri = tokenURIForActor(name);
        healthIDNFT.mintCredential(actorAddress, uint256(uint160(actorAddress)), uri);
        token.mint(actorAddress, actorReward);

        emit ActorVerified(actorAddress, role, name);
    }

    function awardQuest(address user, uint256 reward, string calldata questId) external onlyRole(QUEST_ADMIN_ROLE) {
        require(user != address(0), "Invalid user");
        require(reward > 0, "Reward must be > 0");

        questRewards[user] += reward;
        token.mint(user, reward);

        emit QuestRewarded(user, questId, reward);
    }

    function isVerifiedActor(address actor) external view returns (bool) {
        return actors[actor].verified;
    }

    function getActor(address actor) external view returns (
        bool verified,
        ActorRole role,
        string memory name,
        string memory licenseId,
        string memory phone
    ) {
        Actor memory a = actors[actor];
        return (a.verified, a.role, a.name, a.licenseId, a.phone);
    }

    function tokenURIForActor(string memory name) public pure returns (string memory) {
        return string(abi.encodePacked("https://example.com/metadata/", name));
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
