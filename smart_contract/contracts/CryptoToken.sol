// SPDX-License-Identifier: GPL-3.0

pragma solidity >= 0.7.0 < 0.9.0;
import "hardhat/console.sol";

interface IERC20 {

    function totalSupply() external view returns (uint256);
	function balanceOf(address _owner) external view returns (uint256 balance);
	function transfer(address _to, uint256 _value) external returns (bool success);
	function allowance(address _owner, address _spender) external view returns (uint256 remaining);
	function approve(address _spender, uint256 _value) external returns (bool success);
	function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);

	event Transfer(address indexed _from, address indexed _to, uint256 _value);
	event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract CryptoToken is IERC20 {

    modifier isOwner() {
        require(msg.sender == owner , "Sender is not owner!");
        _;
    }

    //Properties
    string public constant name = "CryptoToken";
    string public constant symbol = "CRY";
    uint8 public constant decimals = 3;  //Default dos exemplos é sempre 18
    uint256 private totalsupply;
    address public owner;

    enum Status {ACTIVE,PAUSED} 
    Status contractState;


    mapping(address => mapping(address => uint)) allowed;
    mapping(address => uint256) private addressToBalance;

    
    constructor(uint256 total) {
        totalsupply = total;
        owner = msg.sender;
        addressToBalance[owner] = totalsupply;
        contractState = Status.PAUSED;

    }

    //Public Functions
    
    function setState(uint8 status) public isOwner {
        if(status == 1){
            contractState = Status.ACTIVE;
        }
        if(status == 2){
            contractState = Status.PAUSED;
        }
        
    }

    
    
    
    function ownerAddress() public view returns (address){
        return owner;
    }

    function totalSupply() public override view returns(uint256) {
        return totalsupply;
    }


    function balanceOf(address _owner) public view override returns (uint256 balance){
		return addressToBalance[_owner];
	}

	function transfer(address _to, uint256 _value) public virtual override returns (bool success){
		require(contractState == Status.ACTIVE, "Contrato esta pausado!");
        require(addressToBalance[msg.sender] >= _value, 'Not enough balance in the account');
		addressToBalance[_to] += _value;
		addressToBalance[msg.sender] -= _value;

		emit Transfer(msg.sender, _to, _value);
		return true;
	}

	function allowance(address _owner, address _spender) public virtual override view returns (uint256 remaining){
		return allowed[_owner][_spender];
	}

	function approve(address _spender, uint256 _value) public override returns (bool success){
		require(contractState == Status.ACTIVE, "Contrato esta pausado!");
        require(balanceOf(msg.sender) >= _value, 'Not enough balance in sender account');
		require(_value > 0, '0 not allowed');

		allowed[msg.sender][_spender] = _value;

		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	function transferFrom(address _from, address _to, uint256 _value) public virtual override returns (bool success){
		require(contractState == Status.ACTIVE, "Contrato esta pausado!");
        require(balanceOf(_from) >= _value, 'Not enough balance in sender account');

		uint allowedBalance = allowed[_from][msg.sender];
		require(allowedBalance >= _value, 'Required amount not allowed');
		addressToBalance[_to] += _value;
		addressToBalance[_from] -= _value;

		allowed[_from][msg.sender] -= _value;

		emit Transfer(_from, _to, _value);
		return true;
	}
    

    function mint(address account, uint256 amount) public isOwner {
        require(contractState == Status.ACTIVE, "Contrato esta pausado!");

        require(account != address(0), " mint to the zero address");

        totalsupply += amount;
        addressToBalance[account] += amount;
        emit Transfer(address(0), account, amount);       
    }


       function burn(address account, uint256 amount) public isOwner {
        require(contractState == Status.ACTIVE, "Contrato esta pausado!");

        require(account != address(0), " burn from the zero address");
        uint256 accountBalance = addressToBalance[account];
        require(accountBalance >= amount, "burn amount exceeds balance");
        
        addressToBalance[account] = accountBalance - amount;
        
        totalsupply -= amount;

        emit Transfer(account, address(0), amount);

    } 

}