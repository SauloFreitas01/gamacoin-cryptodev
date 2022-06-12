// SPDX-License-Identifier: GPL-3.0

pragma solidity >= 0.7.0 < 0.9.0;
import "hardhat/console.sol";

interface IERC20 {

    // Functions
    function totalSupply() external view returns(uint256);
    function balanceOf(address account) external view returns(uint256);
    function approve(address approved, uint8 quantity) external returns(bool);
    function allowance(address owner, address approved) external view returns(uint256);
    function transfer(address receiver, uint256 amount) external returns(bool);
    function toMint(uint256 amount) external returns(bool);
    function toBurn(uint256 amount) external returns(bool);

    // Events
    event Transfer(address from, address to, uint256 value);
    event Approval(address owner, address approve, uint toSell);

}
contract CryptoToken is IERC20 {

     // Enums
    enum status { ACTIVE, PAUSED, CANCELLED }
    

    //Properties
    string public constant name = "CryptoToken";
    string public constant symbol = "CRY";
    uint8 public constant decimals = 9;  //Default dos exemplos é sempre 18
    uint256 private totalsupply;
    address public owner;
    Status contractState;

    mapping(address => mapping(address => uint)) allowed;
    mapping(address => uint256) private addressToBalance;

    modifier isOwner() {
        require(msg.sender == owner , "Sender is not owner!");
        _;
    }

    constructor(uint256 total) {
        totalsupply = total;
        owner = msg.sender;
        addressToBalance[owner] = totalsupply;
        contractState = Status.ACTIVE;

    }

    //Public Functions

    function totalSupply() public override view returns(uint256) {
        return totalsupply;
    }


    function balanceOf(address tokenOwner) public view override returns (uint256 balance){
		return addressToBalance[tokenOwner];
	}

    function state() public view returns(status) {
        return contractState;
    }

    function allowance(address tokenOwner, address approved) public virtual override view returns (uint256 remaining){
		return allowed[tokenOwner][approved];
	}

    function approve(address approved, uint256 quantity) public override  isOwner returns (bool success){
		require(contractState == Status.ACTIVE, "Contract paused");
        require(balanceOf(msg.sender) >= quantity, 'Not enough balance in sender account');
		require(quantity > 0, 'Value not allowed');

		allowed[msg.sender][approved] = quantity;

		emit Approval(msg.sender, approved, quantity);
		return true;
	}

	function transfer(address receiver, uint256 quantity) public virtual override returns (bool success){
		require(contractState == Status.ACTIVE, "Contract paused");
        require(addressToBalance[msg.sender] >= quantity, 'Not enough balance in the account');
		addressToBalance[receiver] += quantity;
		addressToBalance[msg.sender] -= quantity;

		emit Transfer(msg.sender, receiver, quantity);
		return true;
	}

	
	

	function transferFrom(address sender, address receiver, uint256 quantity) public virtual override returns (bool success){
		require(contractState == Status.ACTIVE, "Contract paused");
        require(balanceOf(sender) >= quantity, 'Not enough balance in sender account');

		uint allowedBalance = allowed[sender][msg.sender];
		require(allowedBalance >= quantity, 'Required amount not allowed');
		addressToBalance[receiver] += quantity;
		addressToBalance[sender] -= quantity;

		allowed[sender][msg.sender] -= quantity;

		emit Transfer(sender, receiver, quantity);
		return true;
	}
    

    function mint(uint256 amount) public isOwner returns(bool) {
        require(contractState == Status.ACTIVE, "Contract paused");

        require(amount != 0, "Cannot mint 0 token");

        totalsupply += amount;
        addressToBalance[owner] += amount;
               
    }


    function burn( uint256 amount) public isOwner returns(bool) {
        require(contractState == Status.ACTIVE, "Contract paused");

        require(amount != 0, "Cannot mint 0 token");
        uint256 accountBalance = addressToBalance[owner];
        require(accountBalance >= amount, "burn amount exceeds balance");
        
        addressToBalance[owner] = accountBalance - amount;
        
        totalsupply -= amount;

       return true;

    } 
    function changeState(uint8 newState) public isOwner returns(bool) {

        require(newState < 3, "Invalid status option!");

        if (newState == 0) {
            require(contractState != status.ACTIVE, "The status is already ACTIVE");
            contractState = status.ACTIVE;
        } else if (newState == 1) {
            require(contractState != status.PAUSED, "The status is already PAUSED");
            contractState = status.PAUSED;
        } else {
            require(contractState != status.CANCELLED, "The status is already CANCELLED");
            contractState = status.CANCELLED;
        }

        return true;
    }

    function kill() public isOwner {
        require(contractState == status.CANCELLED, "It's necessary to cancel the contract before to kill it!");
        //emit Killed(msg.sender);
        selfdestruct(payable(owner));
    }

    

}