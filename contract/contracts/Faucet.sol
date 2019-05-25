pragma solidity 0.5.8;

import "./MockDAI.sol";
import "./DataSource";

contract Faucet {

    MockDAI mdai;
    mapping (address => uint256) public latestPowerRequest;

    constructor(DataSource _idp) public {
        mdai = new MockDAI();
    }

    modifier requireIdentity() {
        require(idp.getAsBool.value(idp.getQueryPrice())(bytes32(uint256(msg.sender))));
        _;
    }

    function requestToken() public requireIdentity {
        uint256 sinceLatestRequest = (now).sub(latestPowerRequest[msg.sender]);
        require(sinceLatestRequest > 30);
        latestPowerRequest[msg.sender] = now;
        require(mdai.mint(msg.sender, 10));
    }
}