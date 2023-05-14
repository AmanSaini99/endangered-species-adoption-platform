// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SanctuaryManager is Ownable {
  struct Animal {
    string name;
    string species;
    string description;
    string birthday;
    uint sanctuaryId;
    address gaurdian;
    uint gardianshipExpiry;
    uint gaurdianshipTokenId;
  }

  struct Sanctuary {
    string name;
    string location;
    uint donations;
    uint[] animalIds;
  }

  struct User {
    uint[] adoptedAnimalsIds;
    uint[] gaurdianshipTokenIds;
    uint[] donationTokenIds;
    uint totalDonations;
  }

  Sanctuary[] internal sanctuaries;
  Animal[] internal animals;
  mapping(address => User) internal users;

  event animalCreated(string _name, string _species);
  event sanctuaryCreated(string _name, string _location);

  function newSanctuary(
    string memory _name,
    string memory _location
  ) public onlyOwner {
    Sanctuary memory sanctuary = Sanctuary(_name, _location, 0, new uint[](0));
    sanctuaries.push(sanctuary);
    emit sanctuaryCreated(_name, _location);
  }

  function newAnimal(
    string memory _name,
    string memory _species,
    string memory _description,
    string memory _birthday,
    uint256 _sanctuaryId
  ) public onlyOwner {
    Animal memory animal = Animal(
      _name,
      _species,
      _description,
      _birthday,
      _sanctuaryId,
      address(0),
      0,
      0
    );
    uint animalId = animals.length;
    animals.push(animal);

    sanctuaries[_sanctuaryId].animalIds.push(animalId);
    emit animalCreated(_name, _species);
  }

  function getSanctuariesCount() public view returns (uint256) {
    return sanctuaries.length;
  }

  function getSanctuaries() public view returns (Sanctuary[] memory) {
    return sanctuaries;
  }

  function getSanctuary(
    uint256 _sanctuaryId
  )
    public
    view
    returns (
      string memory name,
      string memory location,
      uint donations,
      uint[] memory animalIds
    )
  {
    Sanctuary memory s = sanctuaries[_sanctuaryId];
    return (s.name, s.location, s.donations, s.animalIds);
  }

  function getAnimalsCount() public view returns (uint256) {
    return animals.length;
  }

  function getAnimals() public view returns (Animal[] memory) {
    return animals;
  }

  function getAnimal(
    uint256 _animalId
  )
    public
    view
    returns (
      string memory name,
      string memory species,
      string memory description,
      string memory birthday,
      uint sanctuaryId,
      address gaurdian,
      uint gardianshipExpiry,
      uint gaurdianshipTokenId
    )
  {
    Animal memory a = animals[_animalId];
    return (
      a.name,
      a.species,
      a.description,
      a.birthday,
      a.sanctuaryId,
      a.gaurdian,
      a.gardianshipExpiry,
      a.gaurdianshipTokenId
    );
  }

  function getTotalDonationsToSanctuary(
    uint _sanctuaryId
  ) public view returns (uint) {
    return sanctuaries[_sanctuaryId].donations;
  }

  function getToatalAnimalCountInSanctuary(
    uint _sanctuaryId
  ) public view returns (uint) {
    return sanctuaries[_sanctuaryId].animalIds.length;
  }

  function getAnimalIdsInSanctuary(
    uint _sanctuaryId
  ) public view returns (uint[] memory animalIds) {
    return sanctuaries[_sanctuaryId].animalIds;
  }

}
