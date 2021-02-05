pragma solidity ^0.6.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MockDaiToken is ERC20 {
    string public _name = "Mock Dai Token";
    string public _symbol =  "mDai";

     constructor () public ERC20(_name, _symbol) {
         _mint(msg.sender, 1000000000000000000000000);
    }
}