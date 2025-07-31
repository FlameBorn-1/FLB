// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Greeter - A sample contract to demonstrate basic interactions
/// @author Mo
/// @notice You can use this contract to set and retrieve a greeting
/// @custom:security-contact security@flameborn.ai
contract Greeter {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    string private _greeting;
    address public owner;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event GreetingChanged(address indexed changer, string newGreeting);

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /// @notice Initializes the contract with an initial greeting
    /// @param initialGreeting The greeting string
    constructor(string memory initialGreeting) {
        _greeting = initialGreeting;
        owner = msg.sender;
    }

    // -------------------------------------------------------------------------
    // Public & External Functions
    // -------------------------------------------------------------------------

    /// @notice Returns the current greeting
    function greet() external view returns (string memory) {
        return _greeting;
    }

    /// @notice Updates the greeting message
    /// @dev Only the contract owner can change the greeting
    /// @param newGreeting The new greeting string to set
    function setGreeting(string calldata newGreeting) external onlyOwner {
        _greeting = newGreeting;
        emit GreetingChanged(msg.sender, newGreeting);
    }

    // -------------------------------------------------------------------------
    // Admin / Owner Utilities
    // -------------------------------------------------------------------------

    /// @notice Transfers ownership of the contract to another address
    /// @param newOwner The address to be assigned as new owner
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
