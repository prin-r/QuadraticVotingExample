pragma solidity 0.5.8;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract Feeless is Ownable {
    address public execDelegator;

    modifier feeless(address sender) {
        require(msg.sender == execDelegator || msg.sender == sender);
        _;
    }

    function setExecDelegator(address _execDelegator) public onlyOwner {
        execDelegator = _execDelegator;
    }
}