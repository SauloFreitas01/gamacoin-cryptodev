const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoToken erc20 tests", () => {

  let CryptoToken, cryptoToken;

  beforeEach(async () => {
    [owner, address1, address2, address3] = await ethers.getSigners()
    
    CryptoToken = await ethers.getContractFactory("CryptoToken")
    cryptoToken = await CryptoToken.deploy(1000000000)
    await cryptoToken.deployed()
  })

  
  describe("TotalSupply Function", () => {
    it("checking if the total supply is correct", async () => {
      
      const expectedValue = 1000000000
      
      expect(await cryptoToken.totalSupply()).to.equal(expectedValue)
    })
  })

  describe("BalanceOf Function", () => {
    it("checking balance of owner's wallet", async () => {
      const expectedValue = 1000000000;
      
      expect(await cryptoToken.balanceOf(owner.address)).to.equal(expectedValue);
    })
  })
  

  describe("Transfer Function", () => {
    it("checking the transfer, if you are subtracting the value of the sent and adding the receiver", async () => {
      
      const currentBalanceOwner = await cryptoToken.balanceOf(owner.address)
      const currentBalanceReceiver = await cryptoToken.balanceOf(address1.address)
      
      const amountSent = 1000
      
      const transferTx = await cryptoToken.transfer(address1.address, amountSent)
      await transferTx.wait()
      
      const modifiedBalanceOwner = await cryptoToken.balanceOf(owner.address)
      const modifiedBalanceReceiver = await cryptoToken.balanceOf(address1.address)
      
      expect(parseInt(currentBalanceOwner) - amountSent).to.equal(modifiedBalanceOwner)
      expect(parseInt(currentBalanceReceiver) + amountSent).to.equal(modifiedBalanceReceiver)
    })
    
    it("checking multiple outgoing balance transfers", async () => {
      const currentBalanceOwner = await cryptoToken.balanceOf(owner.address)
      
      const amountSent = [1000, 500, 1500]
      
      const transfers = [
        await cryptoToken.transfer(address1.address, amountSent[0]),
        await cryptoToken.transfer(address2.address, amountSent[1]),
        await cryptoToken.transfer(address3.address, amountSent[2])
      ]
      
      for(let i = 0; i < transfers.length; i++) {
        let transferTx = transfers[i]
        transferTx.wait()
      }
      
      const modifiedBalanceOwner = await cryptoToken.balanceOf(owner.address)
      
      const totalAmountSent = amountSent.reduce((soma, i) => parseInt(soma) + parseInt(i))
      
      expect(parseInt(currentBalanceOwner) - totalAmountSent).to.equal(modifiedBalanceOwner)
    })
    
    it("checking multiple balance gain transfers", async () => {
      
      const amountSent = 3000
      
      const transfersOwner = [
        await cryptoToken.transfer(address1.address, amountSent),
        await cryptoToken.transfer(address2.address, amountSent),
        await cryptoToken.transfer(address3.address, amountSent)
      ]
      
      for(let i = 0; i < transfersOwner.length; i++) {
        let transferOwner = transfersOwner[i]
        transferOwner.wait() 
      }
      
      const currentBalanceOwner = await cryptoToken.balanceOf(owner.address)
      
      const transfers = [
        await cryptoToken.connect(address1).transfer(owner.address, amountSent),
        await cryptoToken.connect(address2).transfer(owner.address, amountSent),
        await cryptoToken.connect(address3).transfer(owner.address, amountSent)
      ]
      
      for(let i = 0; i < transfersOwner.length; i++) {
        let transferTx = transfers[i]
        transferTx.wait() 
      }
      
      const modifiedBalanceOwner = await cryptoToken.balanceOf(owner.address)
      
      expect(parseInt(currentBalanceOwner) + (amountSent * 3)).to.equal(modifiedBalanceOwner)
    })
    
    it("checking a transaction with insufficient balance", async () => {
      await expect(cryptoToken.transfer(address1.address, 1000000001)).to.be.revertedWith('Not enough balance in the account')
    })
    
    it("checking quantity equal to 0", async () => {
      await expect(cryptoToken.transfer(address1.address, 0)).to.be.revertedWith("cannot transfer 0 tokens")
    })
  })

  describe("TransferFrom Function", () => {
    it("should transfer an amount between wallets", async () => {
      const amount = 3000;

      await cryptoToken.transfer(address1.address, amount);

      const initialBalanceSender = await cryptoToken.balanceOf(address1.address);
      const initialBalanceReceiver = await cryptoToken.balanceOf(address2.address);

      await cryptoToken.connect(address1).transferFrom(address1.address, address2.address, amount);

      const modifiedBalanceSender = await cryptoToken.balanceOf(address1.address);
      const modifiedBalanceReceiver = await cryptoToken.balanceOf(address2.address);

      expect(initialBalanceSender - amount).to.equal(modifiedBalanceSender);
      expect(initialBalanceReceiver + amount).to.equal(modifiedBalanceReceiver);
    })

    it("should return insufficient balance error", async () => {
      await expect(cryptoToken.connect(address1).transferFrom(address1.address, address2.address, 3000)).to.be.revertedWith("Not enough balance in the account");
    })

    it("should return cannot transfer 0 value error", async () => {
      await expect(cryptoToken.connect(address1).transferFrom(address1.address, address2.address, 0)).to.be.revertedWith("cannot transfer 0 tokens");
    })
  })
    
  describe("State Function", () => {
    it("checking if it is showing the current state", async () => {
      const expectedState = 0
      
      expect(await cryptoToken.state()).to.equal(expectedState)
    })
  })

  describe("ChangeState Function", () => {
    it("checking if the state is changing", async () => {
      const currentState = await cryptoToken.state()
      
      const changeState = await cryptoToken.changeState(1)
      await changeState.wait()
      
      const modifiedState = await cryptoToken.state()
      
      expect(currentState != modifiedState).to.equal(true)
    })
    
    it("checking exceptions when changing state", async () => {
      await expect(cryptoToken.changeState(3)).to.be.revertedWith("Invalid status option!")
      
      await expect(cryptoToken.changeState(0)).to.be.revertedWith("The status is already ACTIVE")
      
      await cryptoToken.changeState(1)
      await expect(cryptoToken.changeState(1)).to.be.revertedWith("The status is already PAUSED")
      
      await cryptoToken.changeState(2)
      await expect(cryptoToken.changeState(2)).to.be.revertedWith("The status is already CANCELLED")
    })
  })

  describe("Mint Function", () => {
    it("checking if you are adding tokens in total supply and checking if the owner is getting the mint value", async () => {
      const currentTotalSupply = await cryptoToken.totalSupply()
      const currentBalanceOwner = await cryptoToken.balanceOf(owner.address)
      
      const amount = 1000
      
      const mint = await cryptoToken.mint(amount)
      await mint.wait()
      
      const modifiedTotalSupply = await cryptoToken.totalSupply()
      const modifiedBalanceOwner = await cryptoToken.balanceOf(owner.address)
      
      expect(parseInt(currentTotalSupply) + amount).to.equal(modifiedTotalSupply)
      expect(parseInt(currentBalanceOwner) + amount).to.equal(modifiedBalanceOwner)
    })
    
    it("checking if the mint is equal to 0", async () => {
      await expect(cryptoToken.mint(0)).to.be.revertedWith("Cannot mint 0 token")
    })
  })

  describe("Burn Function", () => {
    it("checking if it is burning token the total supply and the owner's address", async () => {
      const currentTotalSupply = await cryptoToken.totalSupply()
      const currentBalanceOwner = await cryptoToken.balanceOf(owner.address)
      
      const amount = 1000
      
      const toBurn = await cryptoToken.burn(amount)
      await toBurn.wait()
      
      const modifiedTotalSupply = await cryptoToken.totalSupply()
      const modifiedBalanceOwner = await cryptoToken.balanceOf(owner.address)
      
      expect(parseInt(currentTotalSupply) - amount).to.equal(modifiedTotalSupply)
      expect(parseInt(currentBalanceOwner) - amount).to.equal(modifiedBalanceOwner)
    })
    
    it("checking if the burn is equal to 0", async () => {
      await expect(cryptoToken.burn(0)).to.be.revertedWith("Cannot burn 0 token")
    })
    
    it("checking if it is burning a value above the", async () => {
      await expect(cryptoToken.burn(1000000001)).to.be.revertedWith("burn amount exceeds balance")    
    })
  })
    
  describe("Kill Function", () => {
    it("checking if it's killing the contract", async () => {
      const changeState = await cryptoToken.changeState(2)
      await changeState.wait()
      
      const kill = await cryptoToken.kill()
      await kill.wait()
      
      const confirmation = kill.confirmations
      
      expect(confirmation == 1).to.equal(true)
    })
    
    it("checking that the contract is not canceled on kill", async () => {
      await expect(cryptoToken.kill()).to.be.revertedWith("It's necessary to cancel the contract before to kill it")
    })
  })

  describe("IsOwner Modifier", () => {
    it("checking owner permissions", async () => {
      expect(cryptoToken.connect(address1).changeState(2)).to.be.revertedWith("Sender is not owner!")
      expect(cryptoToken.connect(address1).mint(1000)).to.be.revertedWith("Sender is not owner!")
      expect(cryptoToken.connect(address1).burn(1000)).to.be.revertedWith("Sender is not owner!")
      expect(cryptoToken.connect(address1).kill()).to.be.revertedWith("Sender is not owner!")
    })
  })

  describe("IsActive Modifier", () => {
    it("checking if status is active", async () => {
      await cryptoToken.changeState(1)
      
      await expect(cryptoToken.transfer(address1.address, 1000)).to.be.revertedWith("The contract is not active!")
      await expect(cryptoToken.connect(address1).transferFrom(address1.address, address2.address, 1000)).to.be.revertedWith("The contract is not active!")
      await expect(cryptoToken.mint(1000)).to.be.revertedWith("The contract is not active!")
      await expect(cryptoToken.burn(1000)).to.be.revertedWith("The contract is not active!")
      
      await cryptoToken.changeState(2)
      
      await expect(cryptoToken.transfer(address1.address, 1000)).to.be.revertedWith("The contract is not active!")
      await expect(cryptoToken.connect(address1).transferFrom(address1.address, address2.address, 1000)).to.be.revertedWith("The contract is not active!")
      await expect(cryptoToken.mint(1000)).to.be.revertedWith("The contract is not active!")
      await expect(cryptoToken.burn(1000)).to.be.revertedWith("The contract is not active!")
    })
  })

  describe("NotCancelled", () => {
    it("checking that the status is not canceled", async () => {
      await cryptoToken.changeState(2)
      
      await expect(cryptoToken.totalSupply()).to.be.revertedWith("The contract is cancelled!")
      await expect(cryptoToken.balanceOf(owner.address)).to.be.revertedWith("The contract is cancelled!")
      
    })  
  })
})
