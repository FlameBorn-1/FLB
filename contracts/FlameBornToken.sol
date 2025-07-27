// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract FlameBornToken is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, ERC20PausableUpgradeable, OwnableUpgradeable, ERC20PermitUpgradeable, UUPSUpgradeable {

    /**
    /* @custom:oz-upgrades-unsafe-allow constructor
    /* @custom:dev-run-script scripts/deploy_with_ethers.ts.
    /* @custom:dev-doc https://docs.openzeppelin.com/contracts/4.x/erc20
    */
    // @custom:dev-doc https://docs.openzeppelin.com/contracts/4.x/erc20#ERC20
    // @custom:dev-doc https://docs.openzeppelin.com/contracts/4.x/erc20#ERC20Burnable
    // @custom:dev-doc https://docs.openzeppelin.com/contracts/4.x/erc20#ERC20Pausable
    // @
    uint8 private constant _DECIMALS = 18;
    uint256 private constant _INITIAL_SUPPLY = 1000000 * (10 ** _DECIMALS);


    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) initializer public {
        __ERC20_init("FlameBornToken", "FLB");
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __Ownable_init(initialOwner);
        __ERC20Permit_init("FlameBornToken");
        __UUPSUpgradeable_init();
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
