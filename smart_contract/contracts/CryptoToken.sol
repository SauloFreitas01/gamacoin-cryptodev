// SPDX-License-Identifier: GPL-3.0

pragma solidity >= 0.7.0 < 0.9.0;
import "hardhat/console.sol";
interface IERC20 {

    //Implementado (mais ou menos)
    function totalSupply() external view returns(uint256);
    function balanceOf(address account) external view returns(uint256);
    function transfer(address recipient, uint256 amount) external returns(bool);
    //function approve(address spender, uint256 amount) external returns(bool);
    
    //Não implementados (ainda)
    //function allowence(address owner, address spender) external view returns(uint256);
    //function transferFrom(address sender, address recipient, uint256 amount) external returns(bool);

    //Implementado
    

    //Não está implementado (ainda)
    //event Approval(address owner, address spender, uint256 value);

}

contract CryptoToken is IERC20 {

    //Properties
    string public constant name = "CryptoToken";
    string public constant symbol = "CRY";
    uint8 public constant decimals = 3;  //Default dos exemplos é sempre 18
    uint256 private totalsupply;

    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
    


    mapping(address => uint256) private addressToBalance;

    // Events
    
    event Transfer(address from, address to, uint256 value);
   
    //Constructor
    constructor(uint256 total) {
        
        addressToBalance[msg.sender] = totalsupply;
    }

    //Public Functions
    function totalSupply() public override view returns(uint256) {
        return totalsupply;
    }

    function balanceOf(address tokenOwner) public override view returns(uint256) {
        return addressToBalance[tokenOwner];
    }

    
    function transfer(address receiver, uint256 quantity) public override returns(bool) {
        require(quantity <= addressToBalance[msg.sender], "Insufficient Balance to Transfer");
        addressToBalance[msg.sender] = addressToBalance[msg.sender] - quantity;
        addressToBalance[receiver] = addressToBalance[receiver] + quantity;

        emit Transfer(msg.sender, receiver, quantity);
        return true;
    }




}