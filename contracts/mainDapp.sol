// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20.sol";
import "./GuardianshipNft.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract EndangeredSpeciesDapp is Ownable {
    struct Animal {
        uint256 animalId;
        string name;
        string species;
        string description;
        bool hasGuardian;
        uint256 birthday;
        uint256 sanctuaryId;
    }

    struct Sanctuary {
        string name;
        string location;
        Animal[] animals;
        mapping(address => uint256) donation;
        uint256 totalDonations;
    }

    
    mapping(address => uint256[]) private guardianshipOfAnimals;
    mapping(uint256 => Sanctuary) private sanctuaries;
    mapping(uint256 => uint256) private animalToSanctuary;

    uint256 nextSanctuaryId = 0;
    uint256 nextAnimalId = 0;
    uint256 nextTokenId = 0;
    uint256 private constant DAY_IN_SECONDS = 86400;

    event AnimalCreated(uint256 animalId, string name, string species, uint256 birthday, uint256 sanctuaryId);
    event SanctuaryCreated(uint256 sanctuaryId, string name, string location);
    event GuardianshipCreated(uint256 tokenId, address owner, uint256 animalId, uint256 validUntil);

    EndangeredSpeciesToken token;
    GuardianshipNFT nft;

    constructor(address tokenAddress, address nftAddress) {
        token = EndangeredSpeciesToken(tokenAddress);
        nft = GuardianshipNFT(nftAddress);
    }
 
    // Create a new sanctuary
    function createSanctuary(string memory _name, string memory _location) public onlyOwner {
        Sanctuary storage sanctuary = sanctuaries[nextSanctuaryId];
        sanctuary.name = _name;
        sanctuary.location = _location;
        nextSanctuaryId++;
        emit SanctuaryCreated(nextSanctuaryId - 1, _name, _location);
    }

    // Create a new animal
    function createAnimal(string memory _name, string memory _species, string memory _description, uint256 _birthday, uint256 _sanctuaryId) public onlyOwner {
        Sanctuary storage sanctuary = sanctuaries[_sanctuaryId];
        Animal storage animal = sanctuary.animals[nextAnimalId];
        animal.animalId = nextAnimalId;
        animal.name = _name;
        animal.species = _species;
        animal.description = _description;
        animal.birthday = _birthday;
        animal.sanctuaryId = _sanctuaryId;
        animalToSanctuary[nextAnimalId] = _sanctuaryId;
        nextAnimalId++;
        emit AnimalCreated(animal.animalId, animal.name, animal.species, animal.birthday, animal.sanctuaryId);
    }

    // Donate to a sanctuary and receive an NFT
    function donateToSanctuary(uint256 _sanctuaryId, uint256 _amount) public {
        Sanctuary storage sanctuary = sanctuaries[_sanctuaryId];
        require(_amount > 0, "Donation amount must be greater than 0");
        token.mint(msg.sender, _amount);
        require(_amount <= token.balanceOf(msg.sender), "Not enough balance to make the donation");
        token.transferFrom(msg.sender, address(this), _amount);
        sanctuary.donation[msg.sender] += _amount;
        sanctuary.totalDonations += _amount;
        emit Transfer(msg.sender, address(this), _amount);
    }

    // Subscribe to be a guardian of a particular animal and receive a NFT
    function subscribeToAnimal(uint256 _animalId, uint256 _months) public {
        require(_months > 0, "Subscription period must be greater than 0");
        Sanctuary storage sanctuary = sanctuaries[animalToSanctuary[_animalId]];
        Animal storage animal = sanctuary.animals[_animalId];
        uint256 cost = _months * 10 * (10**token.decimals());
        token.mint(msg.sender, cost);
        require(cost <= token.balanceOf(msg.sender), "Not enough balance to subscribe as a guardian");
        token.transferFrom(msg.sender, address(this), cost);
        animal.hasGuardian = true;
        uint256 tokenId = nft.mint(msg.sender, _animalId);
        uint256 validUntil = block.timestamp + (_months * 30 * DAY_IN_SECONDS);
        guardianshipOfAnimals[msg.sender].push(_animalId);
        Guardianship memory guardianship = Guardianship(tokenId, _animalId, validUntil);
        guardianships[msg.sender].push(guardianship);
        emit GuardianshipCreated(tokenId, msg.sender, _animalId, validUntil);
    }

    // Get the list of animals in a sanctuary
    function getSanctuaryAnimals(uint256 _sanctuaryId) public view returns (Animal[] memory) {
        return sanctuaries[_sanctuaryId].animals;
    }

    // Get the list of NFTs owned by an address
    function getGuardianships(address _owner) public view returns (Guardianship[] memory) {
        return guardianships[_owner];
    }

    // Get the details of an animal
    function getAnimal(uint256 _animalId) public view returns (Animal memory) {
        Sanctuary storage sanctuary = sanctuaries[animalToSanctuary[_animalId]];
        return sanctuary.animals[_animalId];
    }

    // Mint a new NFT and transfer it to the owner
    function mintGuardianshipNFT(address _owner, uint256 _animalId) private returns (uint256) {
        nextTokenId++;
        _safeMint(_owner, nextTokenId);
        return nextTokenId;
    }
}