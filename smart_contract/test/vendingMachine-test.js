const { expect } = require("chai");
const { ethers } = require("hardhat");
const convert = require('ethereum-unit-converter')

describe("vending machine tests", () => {

    let CryptoToken, cryptoToken, VendingMachine, vendingMachine;

    beforeEach(async () => {
        [owner, address1, address2, address3] = await ethers.getSigners()
    
        CryptoToken = await ethers.getContractFactory("CryptoToken")
        cryptoToken = await CryptoToken.deploy(10000000000)
        await cryptoToken.deployed()

        VendingMachine = await ethers.getContractFactory("VendingMachine")
        vendingMachine = await VendingMachine.deploy(cryptoToken.address)
        await vendingMachine.deployed()

        const transferToMachine = await cryptoToken.transfer(vendingMachine.address, 1000000000)
        await transferToMachine.wait()
    })

    describe("RestockToken Function", () => {
        it("checking if you are restocking the tokens", async () => {
            const expectedValue = 10000
            
            const restockToken = await vendingMachine.restockToken(expectedValue)
            await restockToken.wait()
            
            expect(await vendingMachine.tokensQuantity()).to.equal(expectedValue)
        })
        
        it("checking if the restock is equal to 0", async () => {
            await expect(vendingMachine.restockToken(0)).to.be.revertedWith("cannot restock 0 token")
        })
        
        it("checking insufficient value for restock", async () => {
            await expect(vendingMachine.restockToken(1000000001)).to.be.revertedWith("insufficient balance to restock")
        })
    })

    describe("Buy Function", () => {
        it("verifying token purchase if it is leaving tokens from the machine address and adding to the buyer", async () => {
            const restockToken = await vendingMachine.restockToken(100000)
            await restockToken.wait()
            
            const purchasePrice = await vendingMachine.purchasePrice()
            
            const gweiAmount = convert(30, 'gwei', 'wei')
            const tokenAmount = gweiAmount / purchasePrice
            const etherAmount = convert(30, "gwei", "ether")
        
            const currentTokenBalanceMachine = await vendingMachine.tokensQuantity()
            const currentTokenBalanceBuyer = await cryptoToken.balanceOf(address1.address)

            const buyTokens = await vendingMachine.connect(address1).buy({ value: ethers.utils.parseEther(etherAmount) })
            await buyTokens.wait()
            
            const modifiedTokenBalanceMachine = await vendingMachine.tokensQuantity()
            const modifiedTokenBalanceBuyer = await cryptoToken.balanceOf(address1.address)
            
            expect(parseInt(currentTokenBalanceMachine) - tokenAmount).to.equal(modifiedTokenBalanceMachine)
            expect(parseInt(currentTokenBalanceBuyer) + tokenAmount).to.equal(modifiedTokenBalanceBuyer)
        })
    
        it("verifying token purchase if it is adding gwei from the machine address", async () => {
            const restockToken = await vendingMachine.restockToken(100000)
            await restockToken.wait()
            
            const gweiAmount = convert(30, 'gwei', 'wei')
            const etherAmount = convert(30, "gwei", "ether")
            
            const currentGweiBalanceMachine = await vendingMachine.contractBalance()
            
            const buyTokens = await vendingMachine.connect(address1).buy({ value: ethers.utils.parseEther(etherAmount)})
            await buyTokens.wait()
            
            const modifiedGweiBalanceMachine = await vendingMachine.contractBalance()
            
            expect(parseInt(currentGweiBalanceMachine + gweiAmount)).to.equal(modifiedGweiBalanceMachine)
        })
        
        it("checking multiple purchases leaving token from address of the machine", async () => {
            const restockToken = await vendingMachine.restockToken(100000)
            await restockToken.wait()

            const purchasePrice = await vendingMachine.purchasePrice()
            
            const currentTokenBalanceMachine = await vendingMachine.tokensQuantity()
            
            const gweiAmount = convert(30, 'gwei', 'wei')
            const tokenAmount = gweiAmount / purchasePrice
            
            const etherAmount = convert(30, "gwei", "ether")
            
            const buyes = [
                await vendingMachine.connect(address1).buy({ value: ethers.utils.parseEther(etherAmount)}),
                await vendingMachine.connect(address2).buy({ value: ethers.utils.parseEther(etherAmount)}),
                await vendingMachine.connect(address3).buy({ value: ethers.utils.parseEther(etherAmount)})
            ] 
            
            for(let i = 0; i < 3; i++) {
                const buy = buyes[i]
                await buy.wait()
            }
            
            const modifiedTokenBalanceMachine = await vendingMachine.tokensQuantity()
            
            expect(currentTokenBalanceMachine - (tokenAmount * 3)).to.equal(modifiedTokenBalanceMachine)
        })
    
        it("verifying multiple purchases by adding gwei at the address of the machine", async () => {
            const restockToken = await vendingMachine.restockToken(100000)
            await restockToken.wait()
            
            const currentGweiBalanceMachine = await vendingMachine.contractBalance()
            
            const gweiAmount = convert(30, 'gwei', 'wei')
            const etherAmount = convert(30, "gwei", "ether")

            const buyes = [
                await vendingMachine.connect(address1).buy({ value: ethers.utils.parseEther(etherAmount)}),
                await vendingMachine.connect(address2).buy({ value: ethers.utils.parseEther(etherAmount)}),
                await vendingMachine.connect(address3).buy({ value: ethers.utils.parseEther(etherAmount)})
            ] 
            
            for(let i = 0; i < 3; i++) {
                const buy = buyes[i]
                await buy.wait()
            }
            
            const modifiedGweiBalanceMachine = await vendingMachine.contractBalance()
            
            expect(parseInt(currentGweiBalanceMachine) + (gweiAmount * 3)).to.equal(modifiedGweiBalanceMachine)
        })
        
        it("checking purchase with value 0", async () => {
            const restockToken = await vendingMachine.restockToken(100000)
            await restockToken.wait()

            await expect(vendingMachine.connect(address3).buy({ value: ethers.utils.parseEther("0")})).to.be.revertedWith("You need to send some Ether")
        })
        
        it("verifying purchase of an amount above the reserve", async () => {
            const restockToken = await vendingMachine.restockToken(100000)
            await restockToken.wait()
            
            await expect(vendingMachine.connect(address3).buy({ value: ethers.utils.parseEther("10")})).to.be.revertedWith("Not enough tokens in the reserve")
        })
    })
    
    describe("Sell Function", () => {
        it("checking the token output if you are adding tokens to the machine's address and withdrawing from the seller", async () => {
            const restockToken = await vendingMachine.restockToken(100000)
            await restockToken.wait()
            
            const tokenAmount = 1000
            
            const etherAmount = convert(tokenAmount, "gwei", "ether")
            
            const buy = await vendingMachine.connect(address1).buy({ value: ethers.utils.parseEther(etherAmount)})
            await buy.wait()
            
            const currentTokenBalanceMachine = await cryptoToken.balanceOf(vendingMachine.address)
            const currentTokenBalanceSeller = await cryptoToken.balanceOf(address1.address)
            
            const tokenSale = await vendingMachine.connect(address1).sell(tokenAmount)
            await tokenSale.wait()
            
            const modifiedTokenBalanceMachine = await cryptoToken.balanceOf(vendingMachine.address)
            const modifiedTokenBalanceSeller = await cryptoToken.balanceOf(address1.address)
            
            expect(parseInt(currentTokenBalanceMachine) + tokenAmount).to.equal(modifiedTokenBalanceMachine)
            expect(parseInt(currentTokenBalanceSeller) - tokenAmount).to.equal(modifiedTokenBalanceSeller)
        })

        it("verifying multiple sales by adding tokens at the address of the machine", async () => {
            const restockToken = await vendingMachine.restockToken(100000)
            await restockToken.wait()
            
            const gweiAmount = convert(30, 'gwei', 'wei')
            const etherAmount = convert(30, "gwei", "ether")

            const buyes = [
                await vendingMachine.connect(address1).buy({ value: ethers.utils.parseEther(etherAmount)}),
                await vendingMachine.connect(address2).buy({ value: ethers.utils.parseEther(etherAmount)}),
                await vendingMachine.connect(address3).buy({ value: ethers.utils.parseEther(etherAmount)})
            ] 
            
            for(let i = 0; i < 3; i++) {
                const buy = buyes[i]
                await buy.wait()
            }
            
            const currentTokenBalanceMachine = await cryptoToken.balanceOf(vendingMachine.address)

            const sales = [
                await vendingMachine.connect(address1).sell(15),
                await vendingMachine.connect(address2).sell(15),
                await vendingMachine.connect(address3).sell(15)
            ] 
            
            for(let i = 0; i < 3; i++) {
                const sell = sales[i]
                await sell.wait()
            }
            
            const modifiedTokenBalanceMachine = await cryptoToken.balanceOf(vendingMachine.address)
            
            expect(parseInt(currentTokenBalanceMachine) + (15 * 3)).to.equal(modifiedTokenBalanceMachine)
        })
        
        it("checking if you are selling insufficient tokens", async () => {
            const restockToken = await vendingMachine.restockToken(100000)
            await restockToken.wait()
            
            await expect(vendingMachine.connect(address1).sell(1000)).to.be.revertedWith("Insufficient tokens to sell")
        })
        
        it("checking if it is selling 0 tokens", async () => {
            const restockToken = await vendingMachine.restockToken(100000)
            await restockToken.wait()
            
            await expect(vendingMachine.connect(address1).sell(0)).to.be.revertedWith("cannot sell 0 tokens")
        })
        
        it("checking if the machine is without gwei", async () => {
            const restockToken = await vendingMachine.restockToken(100000)
            await restockToken.wait()
            
            const etherAmount = convert(1000, "gwei", "ether")
            
            const buy = await vendingMachine.connect(address1).buy({ value: ethers.utils.parseEther(etherAmount)})
            await buy.wait()
            
            const currentGweiBalanceMachine = await vendingMachine.contractBalance()
            
            const withdraw = await vendingMachine.withdrawEther(currentGweiBalanceMachine)
            await withdraw.wait()
            
            await expect(vendingMachine.connect(address1).sell(100)).to.be.revertedWith("Insufficient gwei")
            
        })
    })

    describe("WithdrawEther Function", () => {
        it("checking if it's withdrawing the ether from the machine", async () => {
            const restockToken = await vendingMachine.restockToken(100000)
            await restockToken.wait()
            
            const etherAmount = convert(1000, "gwei", "ether")
            
            const buy = await vendingMachine.connect(address1).buy({ value: ethers.utils.parseEther(etherAmount)})
            await buy.wait()
            
            const currentGweiBalanceMachine = await vendingMachine.contractBalance()
            
            const withdraw = await vendingMachine.withdrawEther(currentGweiBalanceMachine)
            await withdraw.wait()
            
            const expectedValue = 0
            
            expect(await vendingMachine.contractBalance()).to.equal(expectedValue)
        })
        
        it("checking if it is drawing 0 gwei", async () => {
            await expect(vendingMachine.withdrawEther(0)).to.be.revertedWith("cannot withdraw 0 ethers")
        })
        
        it("checking if you are withdrawing an insufficient amount", async () => {
            const restockToken = await vendingMachine.restockToken(100000)
            await restockToken.wait()
            
            await expect(vendingMachine.withdrawEther(1)).to.be.revertedWith("insufficient balance to withdraw")
        })
    })

    describe("ResetPurchasePrice Function", () => {
        it("checking if you are changing the value of the token for purchase", async () => {
            const expectedPrice = 10000000000
            
            const resetPrice = await vendingMachine.resetPurchasePrice(10000000000)
            await resetPrice.wait()
            
            expect(await vendingMachine.purchasePrice()).to.equal(expectedPrice)
        })
        
        it("checking if the value of the token for purchase is changing to 0", async () => {
            await expect(vendingMachine.resetPurchasePrice(0)).to.be.revertedWith("cannot reset purchase price to 0")
        })
        
        // NÃO TEM ESSE REQUIRE
        // it("checking if it is changing to the current value of the token value for purchase", async () => {
        //     // await vendingMachine.resetPurchasePrice(1)
        //     await expect(vendingMachine.resetPurchasePrice(1000000000)).to.be.revertedWith("is the current price")
        // })
    })
    
    describe("ResetSalePrice", () => {
        it("checking if you are changing the value of the token for sale", async () => {
            const expectedPrice = 10000000000
            
            const resetPrice = await vendingMachine.resetSalePrice(10000000000)
            await resetPrice.wait()
            
            expect(await vendingMachine.salePrice()).to.equal(expectedPrice)
        })
        
        it("checking if the value of the token for sale is changing to 0", async () => {
            await expect(vendingMachine.resetSalePrice(0)).to.be.revertedWith("cannot reset sale price to 0")
        })
        
        // NÃO TEM ESSE REQUIRE
        // it("checking if it is changing to the current value of the token value for sale", async () => {
        //     // await vendingMachine.resetSalePrice(1)
        //     await expect(vendingMachine.resetSalePrice(1000000000)).to.be.revertedWith("is the current price")
        // })
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
})