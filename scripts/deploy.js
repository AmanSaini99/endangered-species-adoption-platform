const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    // Deploy First
    const First = await hre.ethers.getContractFactory('Wild');
    const first = await First.deploy();

    const Second = await hre.ethers.getContractFactory('DonationNFT');
    const second = await Second.deploy();

    const Third = await hre.ethers.getContractFactory('GaurdianshipNFT');
    const third = await Third.deploy();

    const Main = await re.ethers.getContractFactory('Controller');
    const main = await Third.deploy(first.address, second.address, third.address);

    console.log( "First: " + first.address );
    console.log( "Second: " + second.address );
    console.log( "Third: " + third.address );
    console.log( "Main: " + main.address );
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})