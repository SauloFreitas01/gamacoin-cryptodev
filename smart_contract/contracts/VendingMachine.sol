// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./CryptoToken.sol";

contract MyMachine {

    // events
    event Bought(uint256 tokenAmount, uint256 gweiAmount);
    event Sold(uint256 tokenAmount, uint256 gweiAmount);

    // Properties
    address public owner;
    address public tokenAddress;
    uint256 public purchasePrice;
    uint256 public salePrice;
    
    mapping(address => uint) private tokenBalance;    

    // modifiers
    modifier isOwner() {
        require(msg.sender == owner , "Sender is not owner!");
        _;
    }

    // Constructor
    constructor(address token) {
        tokenAddress = token;
        owner = msg.sender;
        purchasePrice = 1 gwei;
        salePrice = 1 gwei;
    }

    // 1 TOKEN NOSSO VALE 1 GWEI
    // 1,000 -> 0,001 = Mwei

    // 3- comprar tokens com ether
    function buy() payable public returns(bool) {
        uint256 amountTobuy = msg.value;
        uint256 balance = CryptoToken(tokenAddress).balanceOf(address(this));
        uint256 tokenValue = amountTobuy / purchasePrice;
        
        require(amountTobuy > 0, "You need to send some Ether");
        require(tokenValue <= balance, "Not enough tokens in the reserve");

        CryptoToken(tokenAddress).transfer(msg.sender, tokenValue);
        tokenBalance[address(this)] -= tokenValue;

        emit Bought(tokenValue, amountTobuy);

        return true;
    }

    // 4- vender tokens por ether
    function sell(uint256 amountToSell) public returns(bool) {
        uint256 balance = CryptoToken(tokenAddress).balanceOf(msg.sender);
        uint256 gweiValue = amountToSell * salePrice;

        require(amountToSell <= balance, "Insufficient tokens to sell");
        require(amountToSell != 0, "cannot sell 0 tokens");
        require(gweiValue <= address(this).balance, "Insufficient gwei");

        payable(address(msg.sender)).transfer(gweiValue);
        CryptoToken(tokenAddress).transfer(address(this), amountToSell);

        tokenBalance[address(this)] += amountToSell;

        emit Sold(amountToSell, gweiValue);
        return true;
    }

    // 5- reabastecer a máquina com token e ether
    function restockToken(uint256 amount) public isOwner returns(bool) {
        require(amount != 0, "cannot restock 0 token");
        
        uint256 balance = CryptoToken(tokenAddress).balanceOf(address(this));
        require(amount <= balance, "insufficient balance to restock");

        tokenBalance[address(this)] += amount;

        return true;
    }

    function restockEther() payable public isOwner returns(bool) {

        return true;
    }

    // 6- sacar saldo em ether
    function withdrawEther(uint256 amount) public isOwner returns(bool) {
        require(amount != 0, "cannot withdraw 0 ethers");
        require(amount <= address(this).balance, "insufficient balance to withdraw");

        payable(address(msg.sender)).transfer(amount);

        return true;
    }

    // 7- redefinir valor do token pra compra
    function resetPurchasePrice(uint256 value) public isOwner returns(bool) {
        require(value != 0, "cannot reset purchase price to 0");
        purchasePrice = value * 1 gwei;

        return true;
    }

    // 8- redefinir valor do token pra venda
    function resetSalePrice(uint256 value) public isOwner returns(bool) {
        require(value != 0, "cannot reset sale price to 0");
        salePrice = value * 1 gwei;

        return true;
    }


    // funções de log
    function tokensQuantity() public view returns (uint256) {
        return tokenBalance[address(this)];
    }

    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
