// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Core upgradeable contracts
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// Access control
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

// ERC20 core and extensions
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";

contract FlameBornToken is 
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    ERC20PermitUpgradeable,
    UUPSUpgradeable
{
    /**
     * @dev MINTER_ROLE allows covenantal contracts to mint new tokens
     */
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /**
     * @custom:oz-upgrades-unsafe-allow constructor
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract with covenantal admin privileges and zero initial supply
     * @param initialOwner The address that will own the contract for governance and role management
     */
    function initialize(address initialOwner) initializer public {
        __ERC20_init("FlameBornToken", "FLB");
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __Ownable_init(initialOwner);
        __AccessControl_init();
        __ERC20Permit_init("FlameBornToken");
        __UUPSUpgradeable_init();
        
        // Grant admin role to initial owner for governance and role management
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        // Ensure governance can delegate minting without pre-minting supply
        _grantRole(MINTER_ROLE, initialOwner);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public {
        require(hasRole(MINTER_ROLE, msg.sender), "Caller is not authorized to mint");
        _mint(to, amount);
    }

    function grantMinterRole(address account) external onlyOwner {
        _grantRole(MINTER_ROLE, account);
    }

    function revokeMinterRole(address account) external onlyOwner {
        _revokeRole(MINTER_ROLE, account);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20Upgradeable, ERC20PausableUpgradeable)
    {
        super._update(from, to, value);
    }
}
