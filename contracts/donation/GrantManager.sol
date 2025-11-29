// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title GrantManager
 * @dev Minimal cUSD grant distribution contract for Celo Sepolia
 */
contract GrantManager is AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    IERC20 public immutable stableToken;
    uint256 public totalFunded;
    uint256 public totalDistributed;

    error InvalidAmount();
    error InvalidRecipient();
    error InvalidToken();
    error InvalidAdmin();
    error LengthMismatch();

    event GrantFunded(address indexed funder, uint256 amount, string note);
    event GrantPaid(address indexed recipient, uint256 amount, string note);
    event EmergencyWithdrawal(address indexed to, uint256 amount);

    constructor(address stableTokenAddress, address admin) {
        if (stableTokenAddress == address(0)) revert InvalidToken();
        if (admin == address(0)) revert InvalidAdmin();

        stableToken = IERC20(stableTokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DISTRIBUTOR_ROLE, admin);
    }

    /**
     * @dev Fund the grant pool with a transferFrom. Approve before calling.
     */
    function fund(uint256 amount, string calldata note) external {
        if (amount == 0) revert InvalidAmount();

        stableToken.safeTransferFrom(msg.sender, address(this), amount);
        totalFunded += amount;
        emit GrantFunded(msg.sender, amount, note);
    }

    /**
     * @dev Allow admin to pull funds from a wallet that has approved this contract.
     */
    function fundFrom(address from, uint256 amount, string calldata note) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (amount == 0) revert InvalidAmount();

        stableToken.safeTransferFrom(from, address(this), amount);
        totalFunded += amount;
        emit GrantFunded(from, amount, note);
    }

    /**
     * @dev Send a grant payout in cUSD.
     */
    function payGrant(address recipient, uint256 amount, string calldata note) public onlyRole(DISTRIBUTOR_ROLE) {
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount == 0) revert InvalidAmount();

        stableToken.safeTransfer(recipient, amount);
        totalDistributed += amount;
        emit GrantPaid(recipient, amount, note);
    }

    /**
     * @dev Batch payouts to multiple recipients.
     */
    function payBatch(address[] calldata recipients, uint256[] calldata amounts, string calldata note) external onlyRole(DISTRIBUTOR_ROLE) {
        if (recipients.length != amounts.length) revert LengthMismatch();

        for (uint256 i = 0; i < recipients.length; i++) {
            payGrant(recipients[i], amounts[i], note);
        }
    }

    /**
     * @dev Admin emergency withdrawal of remaining funds.
     */
    function emergencyWithdraw(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (to == address(0)) revert InvalidRecipient();
        if (amount == 0) revert InvalidAmount();

        stableToken.safeTransfer(to, amount);
        emit EmergencyWithdrawal(to, amount);
    }

    function poolBalance() external view returns (uint256) {
        return stableToken.balanceOf(address(this));
    }
}
