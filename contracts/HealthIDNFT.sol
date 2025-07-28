// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HealthIDNFT
 * @dev Soulbound NFT contract for health identity tokens
 * @notice This contract creates non-transferable NFTs that represent health identities
 */
contract HealthIDNFT is ERC721URIStorage, AccessControl {
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MULTISIG_ROLE = keccak256("MULTISIG_ROLE");

    // Token counter for auto-incrementing token IDs
    uint256 private _tokenIdCounter;

    // Custom errors
    error AdminRequired();
    error SoulboundTransferNotAllowed();
    error SoulboundApprovalNotAllowed();
    error SoulboundSetApprovalForAllNotAllowed();
    error InvalidTokenId();
    error ZeroAddress();

    // Events
    event HealthIDMinted(
        address indexed to,
        uint256 indexed tokenId,
        string metadataURI
    );
    event HealthIDMetadataUpdated(
        uint256 indexed tokenId,
        string newMetadataURI
    );

    /**
     * @dev Constructor sets up the NFT with name, symbol, and initial roles
     * @param admin Address that will have admin privileges
     */
    constructor(address admin) ERC721("HealthIDNFT", "HEALTH") {
        if (admin == address(0)) revert AdminRequired();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(MULTISIG_ROLE, msg.sender);

        // Start token IDs from 1
        _tokenIdCounter = 1;
    }

    /**
     * @dev Override _update to enforce soulbound property
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0)) but block all transfers
        if (from != address(0) && to != address(0)) {
            revert SoulboundTransferNotAllowed();
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Mint a new HealthID NFT with auto-incrementing token ID
     * @param to Address to mint the token to
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to) external onlyRole(MINTER_ROLE) returns (uint256) {
        if (to == address(0)) revert ZeroAddress();

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _mint(to, tokenId);

        emit HealthIDMinted(to, tokenId, "");
        return tokenId;
    }

    /**
     * @dev Mint a new HealthID NFT with metadata URI
     * @param to Address to mint the token to
     * @param metadataURI URI pointing to the token metadata
     * @return tokenId The ID of the newly minted token
     */
    function mintWithMetadata(
        address to,
        string memory metadataURI
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        if (to == address(0)) revert ZeroAddress();

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _mint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit HealthIDMinted(to, tokenId, metadataURI);
        return tokenId;
    }

    /**
     * @dev Update metadata URI for an existing token
     * @param tokenId Token ID to update
     * @param metadataURI New metadata URI
     */
    function updateMetadata(
        uint256 tokenId,
        string memory metadataURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_ownerOf(tokenId) == address(0)) revert InvalidTokenId();

        _setTokenURI(tokenId, metadataURI);
        emit HealthIDMetadataUpdated(tokenId, metadataURI);
    }

    /**
     * @dev Get the current token ID counter value
     * @return Current token ID that will be used for next mint
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Get total number of tokens minted
     * @return Total supply of tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
}
