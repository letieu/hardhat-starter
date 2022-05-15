const hre = require("hardhat");
const {ethers, upgrades} = require("hardhat");

async function main() {
    if (!process.env.OWNER_ADDRESS || process.env.OWNER_ADDRESS.trim() === "") {
        throw new Error("env.OWNER_ADDRESS is not set");
    }

    const ownerAddress = ethers.utils.getAddress(process.env.OWNER_ADDRESS);
    const contractFactory = await ethers.getContractFactory('Payment');
    const payment = await upgrades.deployProxy(contractFactory, [ownerAddress], {initializer: 'initialize'});
    await payment.deployed();

    console.log("Payment proxy deployed to: ", payment.address);

    console.log(await upgrades.erc1967.getImplementationAddress(payment.address)," getImplementationAddress")
    console.log(await upgrades.erc1967.getAdminAddress(payment.address), " getAdminAddress")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
