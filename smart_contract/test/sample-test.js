const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoToken erc20 tests", function () {
  it("should deploy, execute transfer and check", async function () {
    let owner, address1, address2;
    
    const CryptoToken = await ethers.getContractFactory("CryptoToken");
    const cryptoToken = await CryptoToken.deploy('8');
    
    [owner, address1, address2, _] = await ethers.getSigners();
    
    await cryptoToken.deployed();

    describe("deploy",() =>{
      it('should give the tokens to the owner and', async ()=>{
        const ownerBalance = await cryptoToken.balanceOf(owner.address);

        expect(await cryptoToken.totalSupply()).to.equal(ownerBalance);
      });

      it('should be valid owner address', async()=>{
        expect(await cryptoToken.ownerAddress()).to.equal(owner.address);
      })
    })

    describe('Transfer',()=>{
      it('test if there is enough balance',async()=>{
        await expect(cryptoToken.connect(address1).transfer(cryptoToken.ownerAddress(),1)).to.be
        .revertedWith('Not enough balance in the account');
      })

      it('test if the balances of sender and receiver is valid', async()=>{
        const ownerInitialBalance = await cryptoToken.balanceOf(cryptoToken.ownerAddress());
        await cryptoToken.connect(cryptoToken.ownerAddress()).transfer(address1.address,50);

        expect(await cryptoToken.balanceOf(address1.address)).to.be.equal(50);
        expect(await cryptoToken.balanceOf(owner.address)).to.be.equal(ownerInitialBalance - 50);
      })
    })
    
  });
});
