// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract GuardianshipNFT is ERC721, Ownable {
    struct Guardianship {
        uint256 tokenId;
        uint256 start;
        uint256 end;
    }

    mapping(address => Guardianship[]) public guardianships;

    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;
    mapping(uint256 => uint256) private _ownedTokensIndex;
    uint256[] private _allTokens;
    mapping(uint256 => uint256) private _allTokensIndex;


    constructor() ERC721("Endangered Species Guardianship", "ESG") {}

    function mint(address recipient, uint256 duration) public onlyOwner returns (uint256) {
        uint256 tokenId = totalSupply() + 1;
        _mint(recipient, tokenId);
        guardianships[recipient].push(Guardianship(tokenId, block.timestamp, block.timestamp + duration));
        _addTokenToOwnerEnumeration(recipient, tokenId);
        _addTokenToAllTokensEnumeration(tokenId);
        return tokenId;
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
        uint256 length = ERC721.balanceOf(to);
        _ownedTokens[to][length] = tokenId;
        _ownedTokensIndex[tokenId] = length;
    }

    function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
        _allTokensIndex[tokenId] = _allTokens.length;
        _allTokens.push(tokenId);
    }

    function totalSupply() public view virtual returns (uint256) {
        return _allTokens.length;
    }

    function extendSubscription(address recipient, uint256 tokenId) public onlyOwner returns (uint256) {
        uint256 index = _getTokenIndex(recipient, tokenId);
        Guardianship storage guardianship = guardianships[recipient][index];
        require(guardianship.end > block.timestamp, "Guardianship has expired");
        uint256 duration = guardianship.end - block.timestamp;
        guardianship.end += duration;
        return duration;
    }

    function _getTokenIndex(address recipient, uint256 tokenId) private view returns (uint256) {
        uint256 length = guardianships[recipient].length;
        for (uint256 i = 0; i < length; i++) {
            if (ownerOf(tokenId) == recipient && guardianships[recipient][i].start != 0 && guardianships[recipient][i].end != 0) {
                return i;
            }
        }
        revert("Token not found for recipient");
    }

    function burn(address recipient, uint256 tokenId) public onlyOwner {
        _burn(tokenId);
        uint256 index = _getTokenIndex(recipient, tokenId);
        delete guardianships[recipient][index];
        _removeTokenFromAllTokensEnumeration(tokenId);
        _removeTokenFromOwnerEnumeration(recipient, tokenId);
    }

    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) private {
        uint256 lastTokenIndex = ERC721.balanceOf(from) - 1;
        uint256 tokenIndex = _ownedTokensIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];
            _ownedTokens[from][tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }

        delete _ownedTokensIndex[tokenId];
        delete _ownedTokens[from][lastTokenIndex];
    }

    function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private {
        uint256 lastTokenIndex = _allTokens.length - 1;
        uint256 tokenIndex = _allTokensIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _allTokens[lastTokenIndex];
            _allTokens[tokenIndex] = lastTokenId;
            _allTokensIndex[lastTokenId] = tokenIndex;
        }

        delete _allTokensIndex[tokenId];
        _allTokens.pop();
    }

    function hasDurationEnded(uint256 tokenId) public view returns (bool) {
        address _owner = ownerOf(tokenId);
        Guardianship[] memory guardianship = guardianships[_owner];
        for (uint256 i=0; i< guardianship.length; i++){
            if(tokenId == guardianship[i].tokenId){
                return guardianship[i].end <= block.timestamp;
            }
        }
        return false;
    }

}
