const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoToken", function () {
  it("", async function () {
    const CryptoToken = await ethers.getContractFactory("CryptoToken");
    const cryptoToken = await CryptoToken.deploy('8');
    await cryptoToken.deployed();

    expect("CryptoToken").to.equal("CryptoToken");

    //transact and check if it succeeded
   
  });
});
