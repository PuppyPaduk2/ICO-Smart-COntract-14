const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

function datetoTimestamp(_dateString) {
  // Convert the input date string to a Date object
  const date = new Date(_dateString);
  
  // Get the Unix timestamp of the input date
  const timestamp = Math.floor(date.getTime() / 1000);
  
  return timestamp;
}

function big_number(_num) {
  return ethers.utils.parseEther(_num);
}

describe("Initial Coin Offering", function () {
  let ico;
  let token;
  let owner;
  let addr1;
  let addr2;
  let investor1;
  let investor2;
  let startTime = "2023/05/09 12:00:00";
  let endTime = "2023/05/10 12:00:00";
  
  // async function deployTokenFixture() {
  //   [owner, addr1, addr2] = await ethers.getSigners();
  //   const ICOtoken = await ethers.getContractFactory("ICOtoken");
  //   token = await ICOtoken.deploy();
  //   await token.deployed();
  // }

  async function deployICOFixture() {
    [owner, investor1, investor2] = await ethers.getSigners();
    const ICO = await ethers.getContractFactory("ICO");
    const start = datetoTimestamp(startTime);
    const end = datetoTimestamp(endTime);
    ico = await ICO.deploy(start, end);
    await ico.deployed();
  }

  function initTime(_startTime, _endTime) {
    startTime = _startTime;
    endTime = _endTime;
  }

  beforeEach(async function () {
    // await loadFixture(deployTokenFixture);
    await loadFixture(deployICOFixture);
  });

  it("should allow deposits during ICO", async function () {
    const wallet = ico.connect(investor1);
    await expect(wallet.deposit({ value: big_number("0.04") }));
    initTime("2023/05/10 12:00:00", "2023/05/11 12:00:00");
  });

  it("should not allow deposits outside of ICO", async function () {
    const wallet = ico.connect(investor1);
    await expect(wallet.deposit({ value: big_number("0.04") })).to.be.revertedWith("ICO has not yet started.");
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2]);
    await expect(wallet.deposit({ value: big_number("0.04") })).to.be.revertedWith("ICO has ended.");
    initTime("2023/05/09 12:00:00", "2023/05/10 12:00:00");
  });

  it("should not allow deposits below minimum or above maximum", async function () {
    const wallet = ico.connect(investor1);
    await expect(wallet.deposit({ value: big_number("0.001") })).to.be.revertedWith("Deposit amount is below minimum.");
    await expect(wallet.deposit({ value: big_number("0.06") })).to.be.revertedWith("Deposit amount is above maximum.");
  });

  it("should not allow deposits that exceed hard cap", async function () {
    const wallet = ico.connect(investor1);

    for (let i = 0;i < 20;i++) {
      await expect(wallet.deposit({ value: big_number("0.05") }));  
    }
    await expect(wallet.deposit({ value: big_number("0.01") })).to.be.revertedWith("Deposit amount exceeds hard cap.");
  });

  it("should allow withdrawals after ICO ends", async function () {
    const wallet = ico.connect(investor1);
    await wallet.deposit({ value: big_number("0.02") });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2]);
    await ico.close();
    await wallet.withdraw();
    expect(await ico.deposits(investor1.address)).to.equal(0);
  });

  it("should not allow withdrawals during ICO", async function () {
    const wallet = ico.connect(investor1);
    await wallet.deposit({ value: big_number("0.02") });
    await expect(wallet.withdraw()).to.be.revertedWith("Withdrawals not allowed at this time.");
  });

  it("should not allow withdrawals if ICO is successful", async function () {
    const wallet = ico.connect(investor1);
    await wallet.deposit({ value: big_number("0.05") });
    await wallet.deposit({ value: big_number("0.05") });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2]); // advance time by 32 days
    await ico.connect(owner).close();
    expect(await ico.withDraw()).to.equal(false);
    await wallet.claim();
    await expect(wallet.withdraw()).to.be.revertedWith("Cannot withdraw because of ICO success.");
  });

  it("should allow claim after ICO ends", async function () {
    const wallet = ico.connect(investor1);
    await wallet.deposit({ value: big_number("0.05") });
    await wallet.deposit({ value: big_number("0.05") });
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 2]);
    await ico.connect(owner).close();
    await wallet.claim();
    expect(await ico.deposits(investor1.address)).to.equal(0);
  });

  it("should not allow claim during ICO", async function () {
    const wallet = ico.connect(investor1);
    await wallet.deposit({ value: big_number("0.05") });
    await wallet.deposit({ value: big_number("0.05") });
    await expect(wallet.claim()).to.be.revertedWith("Claims not allowed at this time.");
  });
});