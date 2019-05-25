pragma solidity 0.5.8;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

interface DataSource {
  function getQueryPrice() external view returns (uint256);
  function getAsBool(bytes32 key) external payable returns (bool);
}

contract QVT  is Ownable {
    using SafeMath for uint256;

    struct Proposal {
        address proposer;
        uint256 totalStake;
        uint256 totalVote;
        string link;
        string description;
        uint256 numParticipants;
        mapping (address => uint256) userStake;
        mapping (address => uint256) userVote;
    }

    DataSource public idp;

    Proposal[] public proposals;
    mapping (address => uint256) public proposalIds;

    mapping (address => uint256) public powers;
    mapping (address => uint256) public latestPowerRequest;

    constructor(DataSource _idp) public {
        setIdentityProvider(_idp);
        Proposal memory proposal = Proposal({
            proposer: address(0),
            totalStake: 0,
            totalVote: 0,
            link: "address(0)",
            description: "initialProposal",
            numParticipants: 0
        });
        proposalIds[address(0)] = numProposals();
        proposals.push(proposal);
    }

    modifier requireIdentity() {
        require(idp.getAsBool.value(idp.getQueryPrice())(bytes32(uint256(msg.sender))));
        _;
    }

    function() external payable {}

    function sqrt(uint x) public pure returns (uint y) {
        uint z = x.add(1).div(2);
        y = x;
        while (z < y) {
            y = z;
            z = x.div(z).add(z).div(2);
        }
    }

    function getETHBalance() public view returns(uint256) {
        return address(this).balance;
    }

    function getProposalByAddress(address user)
        public
        view
    returns(address, uint256, uint256, string memory, string memory, uint256) {
        require(alreadyProposed(user));
        Proposal storage tmp = proposals[proposalIds[user]];
        return (tmp.proposer, tmp.totalStake, tmp.totalVote, tmp.link, tmp.description, tmp.numParticipants);
    }

    function getUserStatusFromProposal(uint256 id, address user)
        public
        view
    returns(uint256, uint256) {
        require(id < numProposals());
        return (proposals[id].userStake[user], proposals[id].userVote[user]);
    }

    function numProposals() public view returns(uint256) {
        return proposals.length;
    }

    function setIdentityProvider(DataSource _idp) public onlyOwner {
        idp = _idp;
    }

    function setPowerPrivilege(address user, uint256 power) public onlyOwner {
        powers[user] = power;
    }

    function requestPower() public requireIdentity {
        uint256 sinceLatestRequest = (now).sub(latestPowerRequest[msg.sender]);
        require(sinceLatestRequest > 30);
        latestPowerRequest[msg.sender] = now;
        powers[msg.sender] = powers[msg.sender].add(10);
    }

    function alreadyProposed(address user) public view returns(bool) {
        if (user == address(0)) {
            return true;
        }
        return proposalIds[user] > 0;
    }

    function propose(string memory _link, string memory _description) public requireIdentity {
        require(!alreadyProposed(msg.sender));
        Proposal memory proposal = Proposal({
            proposer: msg.sender,
            totalStake: 0,
            totalVote: 0,
            link: _link,
            description: _description,
            numParticipants: 0
        });
        proposalIds[msg.sender] = numProposals();
        proposals.push(proposal);
    }

    function updateProposal(string memory _link, string memory _description) public requireIdentity {
        require(alreadyProposed(msg.sender));

        uint256 pid = proposalIds[msg.sender];

        require(proposals[pid].proposer == msg.sender);

        proposals[pid].link = _link;
        proposals[pid].description = _description;
    }

    function deposit(uint256 pid, uint256 depositAmount) public requireIdentity {
        require(pid < numProposals());
        require(depositAmount > 0);
        require(depositAmount <= powers[msg.sender]);
        require(
            proposals[pid].userStake[msg.sender] == 0 &&
            proposals[pid].userVote[msg.sender] == 0
        );

        uint256 vote = sqrt(depositAmount);
        uint256 stake = vote.mul(vote);

        powers[msg.sender] = powers[msg.sender].sub(stake);

        proposals[pid].totalStake = proposals[pid].totalStake.add(stake);
        proposals[pid].totalVote = proposals[pid].totalVote.add(vote);
        proposals[pid].userStake[msg.sender] = stake;
        proposals[pid].userVote[msg.sender] = vote;
        proposals[pid].numParticipants = proposals[pid].numParticipants.add(1);
    }

    function withdraw(uint256 pid) public requireIdentity {
        require(pid < numProposals());
        require(
            proposals[pid].userStake[msg.sender] > 0 &&
            proposals[pid].userVote[msg.sender] > 0
        );

        uint256 vote = proposals[pid].userVote[msg.sender];
        uint256 stake = proposals[pid].userStake[msg.sender];

        powers[msg.sender] = powers[msg.sender].add(stake);

        proposals[pid].totalStake = proposals[pid].totalStake.sub(stake);
        proposals[pid].totalVote = proposals[pid].totalVote.sub(vote);
        proposals[pid].userStake[msg.sender] = 0;
        proposals[pid].userVote[msg.sender] = 0;
        proposals[pid].numParticipants = proposals[pid].numParticipants.sub(1);
    }
}
