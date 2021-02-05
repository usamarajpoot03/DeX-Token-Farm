pragma solidity ^0.6.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract DeXToken is ERC20 {

    string public _name = "DeX Token";
    string public _symbol =  "DeX";

     constructor () public ERC20(_name, _symbol) {
         _mint(msg.sender, 1000000000000000000000000);
    }
}