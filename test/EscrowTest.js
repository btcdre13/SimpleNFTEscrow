const hre = require("hardhat");
const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Escrow contract", function () {
  // global vars
  let Escrow;
  let escrow;
  let owner;
  let insignator;
  let rider;
  let addr4;


  beforeEach(async function() {

    Escrow = await hre.ethers.getContractFactory("Escrow");
    [insignator, rider, addr4] = await hre.ethers.getSigners();

    escrow = await Escrow.deploy(insignator.address, rider.address);

    await escrow.deployed();
  });

  describe("Deployment", function() {

    it("should set the right insignator and rider", async function() {
      expect(await escrow.insignator()).to.equal(insignator.address);
      expect(await escrow.rider()).to.equal(rider.address);
    });

    it("should mint NFT #0 to the insignator", async function() {
      expect(await escrow.ownerOf(0)).to.equal(insignator.address);
    });

    it("should mint NFT #1 to the rider", async function () {
      expect(await escrow.ownerOf(1)).to.equal(rider.address);
    });
  });

  describe("Flow of Funds", async function() {
    it("should accept deposits", async function() {
      await insignator.sendTransaction({to: escrow.address, value: 1000 });
      expect(await escrow.getBalance()).to.equal(1000);
    });

    it("should let the insignator withdraw the funds again", async function(){
      await insignator.sendTransaction({to: escrow.address, value: 1000});
      expect(await escrow.getBalance()).to.equal(1000);
      expect(await escrow.connect(insignator).withdraw()).to.be.ok;
      expect(await escrow.getBalance()).to.equal(0);
    });

    it("should deny the withdrawal for the rider if the money is not unlocked", async function() {
      await insignator.sendTransaction({to: escrow.address, value: 1000});
      await expect(escrow.connect(rider).withdrawRider()).to.be.revertedWith("The insignator has not unlocked the money yet");
    });

    it("should allow the rider to withdraw the funds once the insignator has unlocked them", async function() {
      await insignator.sendTransaction({to: escrow.address, value: 1000});
      await escrow.connect(insignator).unlockMoney();
      expect(await escrow.connect(rider).withdrawRider()).to.be.ok;
      expect(await escrow.getBalance()).to.equal(0);
    });

    it("should set done to true and lock function calls after the rider has withdrawed", async function() {
      await insignator.sendTransaction({to: escrow.address, value: 1000});
      await escrow.connect(insignator).unlockMoney();
      await escrow.connect(rider).withdrawRider();
      expect(await escrow.done()).to.equal(true);
      await expect(escrow.connect(insignator).withdraw()).to.be.revertedWith("The status of this escrow contract is done");
    })
  })
})