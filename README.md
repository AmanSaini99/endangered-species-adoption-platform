# endangered-species-adoption-platform
For this Project We have created 5 contarcts
1. Wild.sol
2. DonationNFT.sol
3. GuardianshipNFT.sol
4. SanctuaryManager.sol
5. Controller.sol



# Wild.sol
In this smart contract we have created an ERC20 token.

# DonationNFT.sol
In This Smart Contract we have created NFT which will be assigned to users when they will donate to a sanctuary

# GuardianshipNFT.sol
In This Smart Contract we have created NFT which will be assigned to users when they will adopt an animal from a sanctuary. This NFT has a validity period After Which this can not be used and will be removed from users account.

# SanctuaryManager.sol
This SmartContract Manages all the users, sanctuaries, animals. This is basically used to create animal, sanctuaries. Only owner is allowed to create these sanctuaries. It also have some getters to provide data for frontend according to use cases.

# Controller.sol
This SmartContart is our main smart contract that interacts with the users and allows them to donate for a sanctuary or adopt an animal.

In this Smart Contract We have several functions to support user to donate and adopt animals.
1. adoptAnimal: Basically this function takes animalId and total months he wants to adopt it for. Then we calculate the cost in ERC20 tokens. For each month user needs to pay 10 tokens. After successfull adoption we also mint guardianshpNFT to the users account with a time period of months for which he has adopted the animal.

2. donateToSanctuary: This allows users to donate to a sanctuary and also mints donationNFT to users account.

3. burnExpiredTokens: This allows Owner to burn the tokens for which expiry date has been passed.

This is a derived contract of SanctuaryManager so it also support all the functions that Sanctuary Manager Supports.

