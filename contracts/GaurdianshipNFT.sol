// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GaurdianshipNFT is ERC721, ERC721Burnable, Ownable {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;
  mapping(uint => uint256[]) public nftData;

  string public baseURI;

  constructor() ERC721("GaurdianshipNFT", "GAURD") {}

  function safeMint(address to) public onlyOwner returns (uint256) {
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(to, tokenId);
    return tokenId;
  }

  function tokenURI(
    uint256 _tokenId
  ) public view override returns (string memory uri) {
    _tokenId;
    return baseURI;
  }

  function setBaseURI(string memory _baseURI) public onlyOwner {
    baseURI = _baseURI;
  }

  function burnByController(uint256 tokenId) public onlyOwner {
    _burn(tokenId);
  }
}
