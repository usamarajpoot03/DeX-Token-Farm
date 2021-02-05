pragma solidity ^0.6.2;

import "./DeXToken.sol";
import "./MockDaiToken.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract DeXTokenFarm is Ownable   {

    string public name = "DeX Token Farm";
    DeXToken public deXToken;
    MockDaiToken public mockDaiToken;

    address[] public stakers;
    mapping(address => uint) public stackingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;
    


    constructor ( MockDaiToken _mockDaiToken, DeXToken _dexToken ) public {
        deXToken = _dexToken;
        mockDaiToken = _mockDaiToken;
    }

    //stake tokens ( same as depositing)
    function stackTokens(uint _amount) public {

        require( _amount > 0, "can not stack 0 tokens");

        mockDaiToken.transferFrom(msg.sender, address(this), _amount);

        stackingBalance[msg.sender] += _amount;

        if(!hasStaked[msg.sender])
            stakers.push(msg.sender);

        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    }

    //unstake tokens ( same as withdrawing )
    function unstakeTokens() public{
        uint balance = stackingBalance[msg.sender];

        require( balance > 0, "no balance to unstake");

        mockDaiToken.transfer(msg.sender, balance);

        stackingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }

    //issue tokens ( as interest)
    function issueTokens() public onlyOwner  {
        
        for(uint i=0; i < stakers.length; i++) {
            address receipient = stakers[i];
            uint balance = stackingBalance[receipient];            
            if(balance > 0) {
                deXToken.transfer(receipient, balance);
            }
        }
    }

}