// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract HealthIDNFTMock is ERC721 {
    uint256 public nextId;

    constructor() ERC721("HealthID", "HID") {}

    function mintCredential(address to, uint256 tokenId, string calldata) external {
        _mint(to, tokenId);
    }
}
