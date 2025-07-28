// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Core upgradeable contracts
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// Access control
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

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
    ERC20PermitUpgradeable,
    UUPSUpgradeable
{
    /**
     * @custom:oz-upgrades-unsafe-allow constructor
     * @custom:dev-run-script scripts/deploy_with_ethers.ts
     * @custom:dev-doc https://docs.openzeppelin.com/contracts/4.x/erc20
     * @dev Token decimals and initial supply constants
     */
    uint8 private constant _DECIMALS = 18;
    uint256 private constant _INITIAL_SUPPLY = 1000000 * (10 ** _DECIMALS);

    /**
     * @custom:oz-upgrades-unsafe-allow constructor
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract with initial owner and mints initial supply
     * @param initialOwner The address that will own the contract and receive initial supply
     */
    function initialize(address initialOwner) initializer public {
        __ERC20_init("FlameBornToken", "FLB");
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __Ownable_init(initialOwner);
        __ERC20Permit_init("FlameBornToken");
        __UUPSUpgradeable_init();
        
        // Mint initial supply to the initial owner
        _mint(initialOwner, _INITIAL_SUPPLY);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
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
