// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./prototipoToken.sol";

contract MyMachine {

    // Properties
    IERC20 public token;
    address ownerToken;
    // address[] private administrators;
    uint256 public machineReserve;
    //address public tokenAddress;

    // Modifiers
    // modifier isAdm() {

    // }

    // Constructor
    constructor() {
        token = new MyToken(1000);
    //    ownerToken = ownerToken.owner;
    }

    // 1 TOKEN NOSSO VALE 1 GWEI
    // 1,000 -> 0,001 = Mwei

    // Public Functions
    function buy(uint256 amount, uint256 payment) public returns(bool) {
        require(amount > 0, "You need to buy at least 1 token");
        require(payment > 0, "You need to pay at least 1 Gwei");
        require(amount <= machineReserve, "Not enough tokens in the reserve");

        //token.tranferEthers(msg.sender, payment);
        //token.transferTonkes(msg.sender, amount);
    }

    function sell(uint256 amount) public returns(bool) {
        require(amount > 0, "You need to sell at least 1 token");
        
        //token.transferFrom(msg.sender, amount);
    }
}