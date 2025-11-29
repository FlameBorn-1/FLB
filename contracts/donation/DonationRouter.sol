// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title FlameBorn Donation Router
 * @dev Enforces the core covenant: >=70% to beneficiaries, with DAO-configurable operational splits
 * @notice The ethical backbone of FlameBorn - No token moves without healing
 */
contract FlameBornDonationRouter is AccessControl, ReentrancyGuard {
    
    // ========== IMMUTABLE COVENANT ==========
    uint256 public constant MIN_BENEFICIARY_SHARE = 70; // >=70% to impact
    uint256 public constant MAX_OPERATIONAL_SHARE = 30; // <=30% to operations
    uint256 public constant PERCENTAGE_BASE = 100;
    
    // ========== ROLES ==========
    bytes32 public constant DAO_GOVERNANCE = keccak256("DAO_GOVERNANCE");
    bytes32 public constant TREASURY_MANAGER = keccak256("TREASURY_MANAGER");
    
    // ========== ALLOCATION STRUCTURE ==========
    struct Allocation {
        uint256 beneficiary;      // 70-80% to health workers
        uint256 coreTeam;         // 10% to core team (minimum)
        uint256 guardianRewards;  // 5% to validators
        uint256 growth;           // 5% to growth & outreach
        uint256 infrastructure;   // 5% to tech infrastructure
        uint256 lastUpdated;
        address updatedBy;
    }
    
    // ========== STATE VARIABLES ==========
    Allocation public currentAllocation;
    
    // Wallet addresses for each allocation category
    address public beneficiaryWallet;
    address public coreTeamWallet;
    address public guardianWallet;
    address public growthWallet;
    address public infrastructureWallet;
    
    // Accepted stablecoin for donations
    IERC20 public immutable cUSD;
    
    // Treasury yield vault for auto-replenishing
    address public yieldVault;
    
    // ========== EVENTS ==========
    event DonationProcessed(
        address indexed donor,
        uint256 amount,
        uint256 beneficiaryAmount,
        uint256 coreTeamAmount,
        uint256 guardianAmount,
        uint256 growthAmount,
        uint256 infrastructureAmount,
        uint256 timestamp
    );
    
    event AllocationUpdated(
        Allocation newAllocation,
        address updatedBy,
        uint256 timestamp
    );
    
    event WalletsUpdated(
        address beneficiaryWallet,
        address coreTeamWallet,
        address guardianWallet,
        address growthWallet,
        address infrastructureWallet,
        address updatedBy
    );
    
    event YieldVaultUpdated(address newVault, address updatedBy);

    // ========== MODIFIERS ==========
    modifier validAllocation(
        uint256 _beneficiary,
        uint256 _coreTeam,
        uint256 _guardian,
        uint256 _growth,
        uint256 _infra
    ) {
        require(_beneficiary >= MIN_BENEFICIARY_SHARE, "Covenant: Beneficiary share < 70%");
        require(_coreTeam + _guardian + _growth + _infra <= MAX_OPERATIONAL_SHARE, "Covenant: Operational share > 30%");
        require(_beneficiary + _coreTeam + _guardian + _growth + _infra == PERCENTAGE_BASE, "Allocation must total 100%");
        _;
    }

    // ========== CONSTRUCTOR ==========
    constructor(
        address _cUSD,
        address _beneficiaryWallet,
        address _coreTeamWallet,
        address _guardianWallet,
        address _growthWallet,
        address _infrastructureWallet,
        address _daoGovernance
    ) {
        // Set stablecoin
        cUSD = IERC20(_cUSD);
        
        // Set initial wallets
        beneficiaryWallet = _beneficiaryWallet;
        coreTeamWallet = _coreTeamWallet;
        guardianWallet = _guardianWallet;
        growthWallet = _growthWallet;
        infrastructureWallet = _infrastructureWallet;
        
        // Set initial allocation (75/10/5/5/5)
        currentAllocation = Allocation({
            beneficiary: 75,
            coreTeam: 10,
            guardianRewards: 5,
            growth: 5,
            infrastructure: 5,
            lastUpdated: block.timestamp,
            updatedBy: msg.sender
        });
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DAO_GOVERNANCE, _daoGovernance);
        _grantRole(TREASURY_MANAGER, _daoGovernance);
        
        // Grant DAO governance the treasury manager role
        _setRoleAdmin(TREASURY_MANAGER, DAO_GOVERNANCE);
    }

    // ========== CORE DONATION ENGINE ==========
    /**
     * @dev Processes donation with automatic covenant-enforced split
     * @param amount Amount of cUSD to donate
     */
    function processDonation(uint256 amount) external nonReentrant {
        require(amount > 0, "Donation must be positive");
        
        // Transfer cUSD from donor to contract
        require(cUSD.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Calculate allocations
        uint256 beneficiaryAmount = (amount * currentAllocation.beneficiary) / PERCENTAGE_BASE;
        uint256 coreTeamAmount = (amount * currentAllocation.coreTeam) / PERCENTAGE_BASE;
        uint256 guardianAmount = (amount * currentAllocation.guardianRewards) / PERCENTAGE_BASE;
        uint256 growthAmount = (amount * currentAllocation.growth) / PERCENTAGE_BASE;
        uint256 infrastructureAmount = (amount * currentAllocation.infrastructure) / PERCENTAGE_BASE;
        
        // Handle rounding errors by giving remainder to beneficiaries
        uint256 totalDistributed = beneficiaryAmount + coreTeamAmount + guardianAmount + growthAmount + infrastructureAmount;
        if (totalDistributed < amount) {
            beneficiaryAmount = beneficiaryAmount + (amount - totalDistributed);
        }
        
        // Distribute to wallets
        require(cUSD.transfer(beneficiaryWallet, beneficiaryAmount), "Beneficiary transfer failed");
        require(cUSD.transfer(coreTeamWallet, coreTeamAmount), "Core team transfer failed");
        require(cUSD.transfer(guardianWallet, guardianAmount), "Guardian transfer failed");
        require(cUSD.transfer(growthWallet, growthAmount), "Growth transfer failed");
        require(cUSD.transfer(infrastructureWallet, infrastructureAmount), "Infrastructure transfer failed");
        
        emit DonationProcessed(
            msg.sender,
            amount,
            beneficiaryAmount,
            coreTeamAmount,
            guardianAmount,
            growthAmount,
            infrastructureAmount,
            block.timestamp
        );
        
        // TODO: Integrate with FLB minting contract for donor/beneficiary rewards
    }

    // ========== DAO GOVERNANCE FUNCTIONS ==========
    /**
     * @dev DAO-governed allocation update with covenant enforcement
     */
    function updateAllocation(
        uint256 _beneficiary,
        uint256 _coreTeam,
        uint256 _guardian,
        uint256 _growth,
        uint256 _infra
    ) external onlyRole(DAO_GOVERNANCE) validAllocation(_beneficiary, _coreTeam, _guardian, _growth, _infra) {
        // Enforce minimum 10% core team allocation for sustainability
        require(_coreTeam >= 10, "Core team allocation must be at least 10% for sustainability");
        
        currentAllocation = Allocation({
            beneficiary: _beneficiary,
            coreTeam: _coreTeam,
            guardianRewards: _guardian,
            growth: _growth,
            infrastructure: _infra,
            lastUpdated: block.timestamp,
            updatedBy: msg.sender
        });
        
        emit AllocationUpdated(currentAllocation, msg.sender, block.timestamp);
    }
    
    /**
     * @dev DAO can update operational wallets
     */
    function updateWallets(
        address _beneficiaryWallet,
        address _coreTeamWallet,
        address _guardianWallet,
        address _growthWallet,
        address _infrastructureWallet
    ) external onlyRole(TREASURY_MANAGER) {
        require(_beneficiaryWallet != address(0) && _coreTeamWallet != address(0), "Invalid wallet addresses");
        
        beneficiaryWallet = _beneficiaryWallet;
        coreTeamWallet = _coreTeamWallet;
        guardianWallet = _guardianWallet;
        growthWallet = _growthWallet;
        infrastructureWallet = _infrastructureWallet;
        
        emit WalletsUpdated(
            _beneficiaryWallet,
            _coreTeamWallet,
            _guardianWallet,
            _growthWallet,
            _infrastructureWallet,
            msg.sender
        );
    }
    
    /**
     * @dev Set yield vault for auto-replenishing growth pool
     */
    function setYieldVault(address _yieldVault) external onlyRole(TREASURY_MANAGER) {
        yieldVault = _yieldVault;
        emit YieldVaultUpdated(_yieldVault, msg.sender);
    }

    // ========== VIEW FUNCTIONS ==========
    /**
     * @dev Returns current allocation breakdown
     */
    function getAllocation() external view returns (Allocation memory) {
        return currentAllocation;
    }
    
    /**
     * @dev Returns all wallet addresses
     */
    function getWallets() external view returns (
        address, address, address, address, address
    ) {
        return (
            beneficiaryWallet,
            coreTeamWallet,
            guardianWallet,
            growthWallet,
            infrastructureWallet
        );
    }

    // ========== EMERGENCY & MAINTENANCE ==========
    /**
     * @dev Emergency recovery function (DAO only)
     */
    function recoverTokens(address tokenAddress, uint256 amount) external onlyRole(TREASURY_MANAGER) {
        IERC20(tokenAddress).transfer(msg.sender, amount);
    }
    
    /**
     * @dev Upgrade contract logic (via proxy pattern)
     */
    function updateContractLogic(address newImplementation) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Would be implemented with Upgradeable Proxy pattern
        // This is a placeholder for the upgrade mechanism
    }
}



