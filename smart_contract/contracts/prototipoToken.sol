// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

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

contract MyToken is IERC20 {

    // Enums
    enum status { ACTIVE, PAUSED, CANCELLED }

    // Properties
    address public owner;
    string public constant name = "MyToken";
    string public constant symbol = "MYT";
    uint8 public constant decimals = 9;
    uint256 private totalsupply;
    status contractState;

    mapping(address => uint256) private addressToBalance;

    mapping(address => mapping(address => uint256)) allowed;

    // Modifiers
    modifier isOwner() {
        require(msg.sender == owner, "Sender is not owner");
        _;
    }

    // Constructor
    constructor(uint256 total) {
        owner = msg.sender;
        totalsupply = total;
        addressToBalance[msg.sender] = totalsupply;
    }

    // Public Funtions
    function totalSupply() public override view returns(uint256) {
        return totalsupply;
    }

    function balanceOf(address tokenOwner) public override view returns(uint256) {
        return addressToBalance[tokenOwner];
    }

    function state() public view returns(status) {
        return contractState;
    }

    function approve(address approved, uint8 quantity) public override isOwner returns(bool) {
        allowed[msg.sender][approved] = quantity;
        emit Approval(msg.sender, approved, quantity);

        return true;
    }

    function allowance(address approver, address approved) public override view returns(uint256) {
        return allowed[approver][approved];
    }

    function transfer(address receiver, uint256 quantity) public override returns(bool) {
        require(quantity <= addressToBalance[msg.sender], "Insufficient Balance to Transfer");
        addressToBalance[msg.sender] = addressToBalance[msg.sender] - quantity;
        addressToBalance[receiver] = addressToBalance[receiver] + quantity;

        emit Transfer(msg.sender, receiver, quantity);
        return true;
    }

    function transferFrom(address seller, uint256 quantity) public returns(bool) {
        //TODO implementar
    }

    function toMint(uint256 amount) public override isOwner returns(bool) {
        totalsupply += amount;
        addressToBalance[msg.sender] += amount;

        return true;
    }

    function toBurn(uint256 amount) public override isOwner returns(bool) {
        totalsupply -= amount;
        addressToBalance[msg.sender] -= amount;

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

    // Kill
    function kill() public isOwner {
        require(contractState == status.CANCELLED, "It's necessary to cancel the contract before to kill it!");
        //emit Killed(msg.sender);
        selfdestruct(payable(owner));
    }
}