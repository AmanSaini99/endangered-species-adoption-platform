// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ESAPImpl is Ownable{
    struct Subscriber {
        address sub;
        mapping(uint256 => uint256) sanctuarySubscriptionPlan;
        mapping(uint256 => uint256) animalSubscriptionPlan;
        mapping(uint256 => uint256) sanctuarySubscriptionTime;
        mapping(uint256 => uint256) animalSubscriptionTime;
        uint256[] sanctuaries;
        uint256[] animals;
    }

    struct Animal {
        uint256 id;
        string species;
        string name;
        Subscriber[] subscriber;
        uint256 totalFunds;
        uint256 totalSubscribers;
    }

    struct Sanctuary {
        string name;
        uint256 id;
        string location;
        uint256 totalAnimals;
        uint256 totalFunds;
        uint256 totalSubscribers;
        address[] subscriber;
        uint256[] animal;
    }

    event SanctuaryCreated(string _name, uint256 indexed id, string _location);
    event AnimalCreated(string _name, uint256 indexed id, string _species);

    mapping(uint256 => Sanctuary) public sanctuaries;
    mapping(uint256 => Animal) public animals;
    mapping(address => Subscriber) public subscribers;

    uint256 public sanctuaryId = 0;
    uint256 public animalId = 0;

    function createSanctuary(
        string memory _name,
        string memory _location
    ) public onlyOwner returns (uint256) {
        uint256 id = sanctuaryId;
        sanctuaries[id].name = _name;
        sanctuaries[id].location = _location;
        sanctuaries[id].id = sanctuaryId;
        sanctuaries[id].totalAnimals = 0;
        sanctuaries[id].totalSubscribers = 0;
        emit SanctuaryCreated(_name, id, _location);
        sanctuaryId++;
        return id;
    }

    function createAnimal(
        string memory _name,
        uint256 _sanctuaryId,
        string memory _species
    ) public onlyOwner returns (uint256) {
        uint256 id = animalId;
        animals[id].name = _name;
        animals[id].species = _species;
        animals[id].id = animalId;
        animals[id].totalSubscribers = 0;
        sanctuaries[_sanctuaryId].animal.push(id);
        sanctuaries[_sanctuaryId].totalAnimals++;
        emit AnimalCreated(_name, id, _species);
        animalId++;
        return id;
    }

    function createSubscriber(
        address _address
    ) public onlyOwner returns (address) {
        subscribers[_address].sub = _address;
        return _address;
    }

    // function subscribeSanctuary() public  


    // function acceptEther(uint256 amount, address _token) external payable {
    //     //logic amount = price X msg.value
    // }
    function adoptAnimal(uint256 amount, address _token, uint256 id) external {
        IERC20 token = IERC20(_token);
        token.approve(msg.sender, address(this))
        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "you have to approve control of tokens"
        );
        token.transferFrom(msg.sender, address(this), amount);


        //logic starts
    }

    function accept(uint256 amount, address _token) external {
        IERC20 token = IERC20(_token);
        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "you have to approve control of tokens"
        );
        token.transferFrom(msg.sender, address(this), amount);
        //logic starts
    }

    function returnToken(uint256 amount, address _token) external {
        IERC20 token = IERC20(_token);
        token.transfer(msg.sender, amount);
    }
}