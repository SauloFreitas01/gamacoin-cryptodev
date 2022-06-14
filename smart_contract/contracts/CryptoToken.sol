// SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.7.0 < 0.9.0;

interface IERC20 {

    // Functions
    function totalSupply() external view returns(uint256);
    function balanceOf(address account) external view returns(uint256);
    function approve(address approved, uint256 quantity) external returns(bool);
    function allowance(address owner, address approved) external view returns(uint256);
    function transfer(address receiver, uint256 amount) external returns(bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    // Events
    event Transfer(address from, address to, uint256 value);
    event Approval(address owner, address approve, uint toSell);

}

contract CryptoToken is IERC20 {

    // Enums
    enum Status { ACTIVE, PAUSED, CANCELLED }
    
    //Properties
    string public constant name = "CryptoToken";
    string public constant symbol = "CRY";
    uint8 public constant decimals = 9;  //Default dos exemplos é sempre 18
    uint256 private totalsupply;
    address public owner;
    Status contractState;

    mapping(address => mapping(address => uint)) allowed;
    mapping(address => uint256) private balances;

    // modifiers
    modifier isOwner() {
        require(msg.sender == owner , "Sender is not owner!");
        _;
    }

    modifier isActived() {
        require(contractState == Status.ACTIVE, "The contract is not acvite!");
        _;
    }

    modifier notCancelled() {
        require(contractState != Status.CANCELLED, "The contract is not acvite!");
        _;
    }

    constructor(uint256 total) {
        totalsupply = total;
        owner = msg.sender;
        balances[owner] = totalsupply;
        contractState = Status.ACTIVE;

    }

    //Public Functions

    function totalSupply() public override view notCancelled returns(uint256) {
        return totalsupply;
    }

    function balanceOf(address tokenOwner) public view override notCancelled returns (uint256 balance){
		return balances[tokenOwner];
	}

    function state() public view returns(Status) {
        return contractState;
    }

    function allowance(address tokenOwner, address approved) public virtual override view notCancelled returns (uint256 remaining){
		return allowed[tokenOwner][approved];
	}
    
	function transfer(address receiver, uint256 quantity) public virtual override isActived returns (bool success){
        require(balances[msg.sender] >= quantity, 'Not enough balance in the account');
		balances[receiver] += quantity;
		balances[msg.sender] -= quantity;

		emit Transfer(msg.sender, receiver, quantity);
		return true;
	}

        function mint(uint256 amount) public isOwner isActived returns(bool) {
        require(amount != 0, "Cannot mint 0 token");

        totalsupply += amount;
        balances[owner] += amount;

        return true;          
    }


    function burn( uint256 amount) public isOwner isActived returns(bool) {
        require(amount != 0, "Cannot mint 0 token");
        uint256 accountBalance = balances[owner];
        require(accountBalance >= amount, "burn amount exceeds balance");
        
        balances[owner] = accountBalance - amount;
        
        totalsupply -= amount;

       return true;

    } 
    
    function changeState(uint8 newState) public isOwner returns(bool) {

        require(newState < 3, "Invalid status option!");

        if (newState == 0) {
            require(contractState != Status.ACTIVE, "The status is already ACTIVE");
            contractState = Status.ACTIVE;
        } else if (newState == 1) {
            require(contractState != Status.PAUSED, "The status is already PAUSED");
            contractState = Status.PAUSED;
        } else {
            require(contractState != Status.CANCELLED, "The status is already CANCELLED");
            contractState = Status.CANCELLED;
        }

        return true;
    }

    function approve(address approved, uint256 quantity) public override isOwner returns(bool){
		require(contractState == Status.ACTIVE, "Contract paused");
        require(balanceOf(msg.sender) >= quantity, 'Not enough balance in sender account');
		require(quantity > 0, 'Value not allowed');

		allowed[msg.sender][approved] = quantity;

		emit Approval(msg.sender, approved, quantity);
		return true;
	}

	function transferFrom(address sender, address receiver, uint256 quantity) public virtual override isActived returns (bool success){
		require(contractState == Status.ACTIVE, "Contract paused");
        require(balanceOf(sender) >= quantity, 'Not enough balance in sender account');

		uint allowedBalance = allowed[sender][msg.sender];
		require(allowedBalance >= quantity, 'Required amount not allowed');
		balances[receiver] += quantity;
		balances[sender] -= quantity;

		allowed[sender][msg.sender] -= quantity;

		emit Transfer(sender, receiver, quantity);
		return true;
	}

    function kill() public isOwner {
        require(contractState == Status.CANCELLED, "It's necessary to cancel the contract before to kill it!");
        //emit Killed(msg.sender);
        selfdestruct(payable(owner));
    }

}