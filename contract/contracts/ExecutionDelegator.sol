pragma solidity 0.5.8;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";


contract ExecutionDelegator {
  using SafeMath for uint256;

  event SendDelegatedExecution(
    address indexed relayer,
    address indexed sender,
    address indexed to,
    uint256 msTime,
    bytes4 funcInterface
  );

  mapping (address => uint256) public lastMsTimes;

  function verify(address sender, uint256 time, bytes memory data, bytes memory sig)
    public pure returns (bool)
  {
    bytes32 hash = ECDSA.toEthSignedMessageHash(keccak256(abi.encodePacked(time, data)));
    return sender == ECDSA.recover(hash, sig);
  }

  function sendDelegatedExecution(
    address sender,
    address to,
    bytes4 funcInterface,
    uint256 msTime,
    bytes memory data,
    bytes memory senderSig
  ) public {
    uint256 lastMsTime = lastMsTimes[sender];
    require(msTime > lastMsTime);
    require(msTime < now.add(60).mul(1000));
    require(verify(sender, msTime, data, senderSig));
    lastMsTimes[sender] = msTime;
    (bool ok,) = to.call(abi.encodePacked(funcInterface,  uint256(sender), data));
    require(ok);
    emit SendDelegatedExecution(msg.sender, sender, to, msTime, funcInterface);
  }
}