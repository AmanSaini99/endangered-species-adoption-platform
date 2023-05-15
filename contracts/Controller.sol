// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./interfaces/IERC20.sol";
import "./interfaces/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SanctuaryManager.sol";

contract Controller is Ownable, SanctuaryManager {
  IERC20 public wild;
  IERC721 public donationNFT;
  IERC721 public gaurdianshipNFT;

  constructor(address _wild, address _donationNFT, address _gaurdianshipNFT) {
    wild = IERC20(_wild);
    donationNFT = IERC721(_donationNFT);
    gaurdianshipNFT = IERC721(_gaurdianshipNFT);
    sanctuaries.push(Sanctuary("Dummy_sanctuary", "dummy", 0, new uint[](0)));
    animals.push(
      Animal("Dummy_animal", "dummy", "dummy", "dummy", 0, address(0), 0, 0)
    );
  }

  event donationRecieved(uint _sanctuaryId, uint _amount);
  event animalAdopted(uint _animalId, uint months);
  event tokensBurned(string msg);

  function donateToSanctuary(
    uint _sanctuaryId,
    uint _amount
  ) public returns (uint) {
    wild.transferFrom(msg.sender, address(this), _amount);
    uint tokenId = donationNFT.safeMint(msg.sender);
    sanctuaries[_sanctuaryId].donations += _amount;
    users[msg.sender].totalDonations += _amount;
    users[msg.sender].donationTokenIds.push(tokenId);
    emit donationRecieved(_sanctuaryId, _amount);
    return tokenId;
  }

  function adoptAnimal(uint _animalId, uint months) public returns (uint) {
    require(
      animals[_animalId].gaurdian == address(0),
      "Animal already adopted"
    );
    require(animals[_animalId].sanctuaryId != 0, "Animal does not exist");
    require(months > 0, "Months must be greater than 0");
    uint cost = months * 10 * (10 ** wild.decimals());
    require(wild.balanceOf(msg.sender) >= cost, "Insufficient WILD balance");
    wild.transferFrom(msg.sender, address(this), cost);
    uint tokenId = gaurdianshipNFT.safeMint(msg.sender);
    animals[_animalId].gaurdian = msg.sender;
    animals[_animalId].gardianshipExpiry = block.timestamp + months * 30 days;
    animals[_animalId].gaurdianshipTokenId = tokenId;
    users[msg.sender].adoptedAnimalsIds.push(_animalId);
    users[msg.sender].gaurdianshipTokenIds.push(tokenId);
    emit animalAdopted(_animalId, months);
    return tokenId;
  }

  function isGaurdianshipExpired(
    uint _animalId
  ) public view returns (bool isExpired) {
    return animals[_animalId].gardianshipExpiry < block.timestamp;
  }

  function getAlladoptedAnimals() public view returns (uint[] memory adoptedAnimalsIds) {
    return users[msg.sender].adoptedAnimalsIds;
  }

  function burnExpiredTokens() public onlyOwner {
    for (uint i = 1; i < animals.length; i++) {
      if(animals[i].gaurdian == address(0)) continue;
      else if (isGaurdianshipExpired(i)) {
        gaurdianshipNFT.burnByController(animals[i].gaurdianshipTokenId);
        address gaurdian = animals[i].gaurdian;
        for (uint j = 0; j < users[gaurdian].gaurdianshipTokenIds.length; j++) {
          if (
            users[gaurdian].gaurdianshipTokenIds[j] ==
            animals[i].gaurdianshipTokenId
          ) {
            users[gaurdian].gaurdianshipTokenIds[j] = users[gaurdian]
              .gaurdianshipTokenIds[
                users[gaurdian].gaurdianshipTokenIds.length - 1
              ];
            users[gaurdian].gaurdianshipTokenIds.pop();

            users[gaurdian].adoptedAnimalsIds[j] = users[gaurdian]
              .adoptedAnimalsIds[users[gaurdian].adoptedAnimalsIds.length - 1];
            users[gaurdian].adoptedAnimalsIds.pop();
            break;
          }
        }
        animals[i].gaurdian = address(0);
        animals[i].gardianshipExpiry = 0;
        animals[i].gaurdianshipTokenId = 0;
      }
    }
    emit tokensBurned("All expired tokens have been burned");
  }
}
