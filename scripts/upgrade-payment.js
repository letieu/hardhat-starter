const { ethers, upgrades } = require("hardhat");

async function main() {
    if (!process.env.PAYMENT_PROXY_ADDRESS) {
        throw new Error("env.PAYMENT_PROXY_ADDRESS is not set");
    }

    const proxyAddress = process.env.PAYMENT_PROXY_ADDRESS;
    const factory = await ethers.getContractFactory("Payment");
    const upgraded = await upgrades.upgradeProxy(proxyAddress, factory);
    console.log('Upgraded');
    console.log(await upgrades.erc1967.getImplementationAddress(upgraded.address)," getImplementationAddress")
    console.log(await upgrades.erc1967.getAdminAddress(upgraded.address), " getAdminAddress")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
