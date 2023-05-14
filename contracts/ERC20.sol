// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract EndangeredSpeciesToken is ERC20, Ownable {
    constructor() ERC20("Endangered Species Token", "EST") {}
    function mint(address recipient, uint256 amount) public  onlyOwner{
        _mint(recipient, amount);
    }
}