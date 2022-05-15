const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Payment", function () {
  let contract;
  let deployer;
  let owner;
  let buyer1;
  let buyer2;

  beforeEach(async () => {
    [deployer, owner, buyer1, buyer2] = await ethers.getSigners();

    const Payment = await ethers.getContractFactory("Payment");
    contract = await Payment.deploy();

    contract = await upgrades.deployProxy(Payment, [ owner.address], {
      initializer: 'initialize'
    });
    await contract.deployed();
  });

  it("Should deploy", async function () {
    expect(await contract.owner()).to.equal(owner.address);
  });
  it("Should upgrade", async function () {
    await contract.connect(buyer1).buyItem(1, { value: ethers.utils.parseEther("1") });
    await contract.connect(buyer2).buyItem(3, { value: ethers.utils.parseEther("1") });

    const Payment = await ethers.getContractFactory("Payment");
    const upgraded = await upgrades.upgradeProxy(contract.address, Payment);

    expect(await upgraded.owner()).to.equal(owner.address);
    expect(await upgraded.itemToOwner(1)).to.equal(buyer1.address);
    expect(await upgraded.itemToOwner(2)).to.equal(buyer2.address);
    expect(await upgraded.itemIds()).to.equal(2);
    expect(await upgraded.getBalance(), ethers.utils.parseEther("2"));

    await contract.connect(buyer2).buyItem(3, { value: ethers.utils.parseEther("3") });
    expect(await upgraded.itemToOwner(3)).to.equal(buyer2.address);
    expect(await upgraded.itemIds()).to.equal(3);
    expect(await upgraded.getBalance(), ethers.utils.parseEther("5"));
  });

  it("Should buyItem", async function () {
    await contract.connect(buyer1).buyItem(1, { value: ethers.utils.parseEther("1") });
    expect(await contract.itemToOwner(1)).to.equal(buyer1.address);
    expect(await contract.itemToValue(1)).to.equal(ethers.utils.parseEther("1"));
    expect(await contract.itemToType(1)).to.equal(1);
    expect(await contract.typeCount(1)).to.equal(1);

    await contract.connect(buyer2).buyItem(1, { value: ethers.utils.parseEther("1") });
    expect(await contract.itemToOwner(1)).to.equal(buyer1.address);
    expect(await contract.itemToValue(1)).to.equal(ethers.utils.parseEther("1"));
    expect(await contract.itemToType(1)).to.equal(1);
    expect(await contract.typeCount(1)).to.equal(2);

    expect(await contract.getBalance(), ethers.utils.parseEther("2"));
  });

  it("Should withdraw", async function () {
    await contract.connect(buyer1).buyItem(1, { value: ethers.utils.parseEther("1") });
    await contract.connect(buyer1).buyItem(3, { value: ethers.utils.parseEther("1") });
    await contract.connect(buyer1).buyItem(1, { value: ethers.utils.parseEther("3") });
    await contract.connect(buyer2).buyItem(2, { value: ethers.utils.parseEther("3") });

    expect(await contract.getBalance(), ethers.utils.parseEther("8"));
    await contract.connect(owner).withdraw();
    expect(await contract.getBalance(), ethers.utils.parseEther("0"));
  });
});
