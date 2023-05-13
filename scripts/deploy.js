const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    // Deploy First
    const First = await hre.ethers.getContractFactory('ESAP');
    const first = await First.deploy();


    const Second = await hre.ethers.getContractFactory('ESAPImpl');
    const second = await Second.deploy();

    // const Third = await hre.ethers.getContractFactory('');
    // const third = await Third.deploy();

    console.log( "First: " + first.address );
    console.log( "Second: " + second.address );
    // console.log( "Second: " + third.address );
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})