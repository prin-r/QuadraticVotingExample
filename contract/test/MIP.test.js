const { shouldFail, time } = require('openzeppelin-test-helpers');
require('chai').should();

const MockIdentityProvider = artifacts.require('MockIdentityProvider');
const QVT = artifacts.require('QVT');
const MockDAI = artifacts.require('MockDAI');

const addr2B32 = x => {
  const op = y => (y.length < 64 ? op('0' + y) : '0x' + y);
  return op(x.slice(2)).toLowerCase();
};

contract('MIP', ([owner, alice, bob, carol]) => {
  beforeEach(async () => {
    this.mip = await MockIdentityProvider.new({ from: owner });
    this.qvt = await QVT.new(this.mip.address, { from: owner });
    this.mdai = await MockDAI.new({ from: owner });
  });
  context('Context MockIdentityProvider', () => {
    it('Should convert addr to b32 correctly', async () => {
      (await this.mip.addr2B32(owner)).toString().should.eq(addr2B32(owner));
      (await this.mip.addr2B32(alice)).toString().should.eq(addr2B32(alice));
      (await this.mip.addr2B32(bob)).toString().should.eq(addr2B32(bob));
      (await this.mip.addr2B32(carol)).toString().should.eq(addr2B32(carol));
    });
    it('No one should have an identity at the beginning', async () => {
      (await this.mip.identities(addr2B32(owner)))
        .toString()
        .should.eq('false');
      (await this.mip.identities(addr2B32(alice)))
        .toString()
        .should.eq('false');
      (await this.mip.identities(addr2B32(bob))).toString().should.eq('false');
      (await this.mip.identities(addr2B32(carol)))
        .toString()
        .should.eq('false');
    });
    it('Alice should have an identity after she has been added', async () => {
      (await this.mip.identities(addr2B32(alice)))
        .toString()
        .should.eq('false');

      await this.mip.addMe({ from: alice });
      (await this.mip.identities(addr2B32(alice))).toString().should.eq('true');
    });
    it('Anyone should be able to get query price', async () => {
      (await this.mip.getQueryPrice()).toString().should.eq('0');
    });
    it('Only owner should be able to set query price', async () => {
      await this.mip.setQueryPrice(20, { from: owner });
      (await this.mip.getQueryPrice()).toString().should.eq('20');

      await shouldFail.reverting(this.mip.setQueryPrice(99, { from: alice }));
      await shouldFail.reverting(this.mip.setQueryPrice(99, { from: bob }));
      await shouldFail.reverting(this.mip.setQueryPrice(99, { from: carol }));
      (await this.mip.getQueryPrice()).toString().should.eq('20');
    });
  });
  context('Context QVT initialization', () => {
    it('Check Datasource', async () => {
      (await this.qvt.idp()).toString().should.eq(this.mip.address);
    });
    it('Owner of QVT can set the datasource', async () => {
      (await this.qvt.idp()).toString().should.eq(this.mip.address);

      const otherMip = await MockIdentityProvider.new({ from: alice });
      await this.qvt.setIdentityProvider(otherMip.address, { from: owner });

      (await this.qvt.idp()).toString().should.eq(otherMip.address);
    });
    it('None owner of QVT can not set the datasource', async () => {
      (await this.qvt.idp()).toString().should.eq(this.mip.address);

      const otherMip = await MockIdentityProvider.new({ from: owner });
      await shouldFail.reverting(
        this.qvt.setIdentityProvider(otherMip.address, { from: alice }),
      );

      (await this.qvt.idp()).toString().should.eq(this.mip.address);
    });
    it('Sqrt should be correct', async () => {
      (await this.qvt.sqrt('4')).toString().should.eq('2');
      (await this.qvt.sqrt('9')).toString().should.eq('3');
      (await this.qvt.sqrt('16')).toString().should.eq('4');
      (await this.qvt.sqrt('49')).toString().should.eq('7');
      (await this.qvt.sqrt('100')).toString().should.eq('10');
      (await this.qvt.sqrt('256')).toString().should.eq('16');
      (await this.qvt.sqrt('2401')).toString().should.eq('49');
      (await this.qvt.sqrt('1000000')).toString().should.eq('1000');
      (await this.qvt.sqrt('999998000001')).toString().should.eq('999999');
      (await this.qvt.sqrt('1000000000000000000'))
        .toString()
        .should.eq('1000000000');
      (await this.qvt.sqrt('340282366920938463463374607431768211456'))
        .toString()
        .should.eq('18446744073709551616');
    });
  });
  context('Context QVT voting power', () => {
    it('Everyone should have init power 0', async () => {
      (await this.qvt.powers(owner)).toString().should.eq('0');
      (await this.qvt.powers(alice)).toString().should.eq('0');
      (await this.qvt.powers(bob)).toString().should.eq('0');
      (await this.qvt.powers(carol)).toString().should.eq('0');
    });
    it('Only owner should be able to setPowerPrivilege', async () => {
      (await this.qvt.powers(alice)).toString().should.eq('0');
      await this.qvt.setPowerPrivilege(alice, 100, { from: owner });
      (await this.qvt.powers(alice)).toString().should.eq('100');

      await shouldFail.reverting(
        this.qvt.setPowerPrivilege(alice, 9999, { from: alice }),
      );
      (await this.qvt.powers(alice)).toString().should.eq('100');
    });
    it('Can not requestPower if do not have an identity', async () => {
      (await this.qvt.powers(alice)).toString().should.eq('0');
      await shouldFail.reverting(this.qvt.requestPower({ from: alice }));
      (await this.qvt.powers(alice)).toString().should.eq('0');
    });
    it('Anyone who has identity can requestPower', async () => {
      (await this.qvt.powers(alice)).toString().should.eq('0');

      await this.mip.addMe({ from: alice });
      await this.qvt.requestPower({ from: alice });

      (await this.qvt.powers(alice)).toString().should.eq('10');
    });
    it('Should not be able to requestPower if queryPrice is too high', async () => {
      await this.mip.setQueryPrice('20', { from: owner });
      (await this.mip.getQueryPrice()).toString().should.eq('20');

      (await this.qvt.powers(alice)).toString().should.eq('0');

      await this.mip.addMe({ from: alice });
      await shouldFail.reverting(this.qvt.requestPower({ from: alice }));

      (await this.qvt.powers(alice)).toString().should.eq('0');

      (await web3.eth.getBalance(this.qvt.address)).toString().should.eq('0');
      (await web3.eth.getBalance(this.mip.address)).toString().should.eq('0');
      await this.qvt.send(21, { from: alice });
      (await web3.eth.getBalance(this.qvt.address)).toString().should.eq('21');
      await this.qvt.requestPower({ from: alice });
      (await web3.eth.getBalance(this.qvt.address)).toString().should.eq('1');
      (await web3.eth.getBalance(this.mip.address)).toString().should.eq('20');

      (await this.qvt.powers(alice)).toString().should.eq('10');
    });
    it('Should not be able to requestPower more than once in 30 secs', async () => {
      (await this.qvt.powers(alice)).toString().should.eq('0');

      await this.mip.addMe({ from: alice });

      await this.qvt.requestPower({ from: alice });
      (await this.qvt.powers(alice)).toString().should.eq('10');

      await time.increase(time.duration.seconds(10));
      await shouldFail.reverting(this.qvt.requestPower({ from: alice }));
      await time.increase(time.duration.seconds(10));
      await shouldFail.reverting(this.qvt.requestPower({ from: alice }));

      await time.increase(time.duration.seconds(11));
      this.qvt.requestPower({ from: alice });

      (await this.qvt.powers(alice)).toString().should.eq('20');
    });
  });
  context('Context QVT proposal', () => {
    it('address 0 should have been proposed already', async () => {
      (await this.qvt.alreadyProposed(
        '0x0000000000000000000000000000000000000000',
      ))
        .toString()
        .should.eq('true');
    });
    it('Can not propose if do not have an identity', async () => {
      (await this.qvt.alreadyProposed(alice)).toString().should.eq('false');
      await shouldFail.reverting(
        this.qvt.propose('link_alice', 'des_alice', { from: alice }),
      );
      (await this.qvt.alreadyProposed(alice)).toString().should.eq('false');
    });
    it('Can not propose if queryPrice is too high', async () => {
      await this.mip.setQueryPrice('20', { from: owner });
      (await this.mip.getQueryPrice()).toString().should.eq('20');

      await this.mip.addMe({ from: alice });

      (await this.qvt.alreadyProposed(alice)).toString().should.eq('false');
      await shouldFail.reverting(
        this.qvt.propose('link_alice', 'des_alice', { from: alice }),
      );
      (await this.qvt.alreadyProposed(alice)).toString().should.eq('false');

      (await web3.eth.getBalance(this.qvt.address)).toString().should.eq('0');
      (await web3.eth.getBalance(this.mip.address)).toString().should.eq('0');

      await this.qvt.send(21, { from: alice });
      (await web3.eth.getBalance(this.qvt.address)).toString().should.eq('21');

      await this.qvt.propose('link_alice', 'des_alice', { from: alice });
      (await this.qvt.alreadyProposed(alice)).toString().should.eq('true');

      (await web3.eth.getBalance(this.qvt.address)).toString().should.eq('1');
      (await web3.eth.getBalance(this.mip.address)).toString().should.eq('20');
    });
    it('Should be able to propose if have an identity', async () => {
      await this.mip.addMe({ from: alice });

      (await this.qvt.numProposals()).toString().should.eq('1');
      (await this.qvt.alreadyProposed(alice)).toString().should.eq('false');

      await this.qvt.propose('link_alice', 'des_alice', { from: alice });

      (await this.qvt.alreadyProposed(alice)).toString().should.eq('true');
      (await this.qvt.numProposals()).toString().should.eq('2');

      const proposal = await this.qvt.proposals(1);

      proposal.proposer.toString().should.eq(alice);
      proposal.totalStake.toString().should.eq('0');
      proposal.totalVote.toString().should.eq('0');
      proposal.link.toString().should.eq('link_alice');
      proposal.description.toString().should.eq('des_alice');
      proposal.numParticipants.toString().should.eq('0');
    });
  });
  context('Context QVT update proposal', () => {
    beforeEach(async () => {
      await this.mip.addMe({ from: alice });
      await this.mip.addMe({ from: bob });

      (await this.qvt.numProposals()).toString().should.eq('1');
      (await this.qvt.alreadyProposed(alice)).toString().should.eq('false');
      (await this.qvt.alreadyProposed(bob)).toString().should.eq('false');

      await this.qvt.propose('link_alice', 'des_alice', { from: alice });

      (await this.qvt.alreadyProposed(alice)).toString().should.eq('true');
      (await this.qvt.alreadyProposed(bob)).toString().should.eq('false');
      (await this.qvt.numProposals()).toString().should.eq('2');

      let proposal = await this.qvt.proposals(1);

      proposal.proposer.toString().should.eq(alice);
      proposal.totalStake.toString().should.eq('0');
      proposal.totalVote.toString().should.eq('0');
      proposal.link.toString().should.eq('link_alice');
      proposal.description.toString().should.eq('des_alice');
      proposal.numParticipants.toString().should.eq('0');

      await this.qvt.propose('link_bob', 'des_bob', { from: bob });
      (await this.qvt.alreadyProposed(alice)).toString().should.eq('true');
      (await this.qvt.alreadyProposed(bob)).toString().should.eq('true');
      (await this.qvt.numProposals()).toString().should.eq('3');

      proposal = await this.qvt.proposals(2);

      proposal.proposer.toString().should.eq(bob);
      proposal.totalStake.toString().should.eq('0');
      proposal.totalVote.toString().should.eq('0');
      proposal.link.toString().should.eq('link_bob');
      proposal.description.toString().should.eq('des_bob');
      proposal.numParticipants.toString().should.eq('0');
    });
    it('Proposer should be able to update his/her proposal', async () => {
      await this.qvt.updateProposal('new_link_alice', 'new_des_alice', {
        from: alice,
      });

      let proposal = await this.qvt.proposals(1);

      proposal.proposer.toString().should.eq(alice);
      proposal.totalStake.toString().should.eq('0');
      proposal.totalVote.toString().should.eq('0');
      proposal.link.toString().should.eq('new_link_alice');
      proposal.description.toString().should.eq('new_des_alice');
      proposal.numParticipants.toString().should.eq('0');

      await this.qvt.updateProposal('new_link_bob', 'new_des_bob', {
        from: bob,
      });

      proposal = await this.qvt.proposals(2);

      proposal.proposer.toString().should.eq(bob);
      proposal.totalStake.toString().should.eq('0');
      proposal.totalVote.toString().should.eq('0');
      proposal.link.toString().should.eq('new_link_bob');
      proposal.description.toString().should.eq('new_des_bob');
      proposal.numParticipants.toString().should.eq('0');
    });
    it('Carol should not be able to update his/her proposal, because Carol has not been proposed anything before', async () => {
      await this.mip.addMe({ from: carol });
      await shouldFail.reverting(
        this.qvt.updateProposal('new_link_carol', 'new_des_carol', {
          from: carol,
        }),
      );
    });
  });
  context('Context QVT deposit/withdraw, solo', () => {
    beforeEach(async () => {
      await this.mip.addMe({ from: owner });
      await this.qvt.propose('link_owner', 'des_owner', { from: owner });
    });
    it('Can not deposit if do not have identity', async () => {
      await shouldFail.reverting(
        this.qvt.deposit(1, 0, {
          from: alice,
        }),
      );
    });
    it('Can not deposit if voting power input is 0 or your voting power is 0', async () => {
      await this.mip.addMe({ from: alice });
      await shouldFail.reverting(this.qvt.deposit(1, 0, { from: alice }));
    });
    it('Can not deposit if voting power input is 0', async () => {
      await this.mip.addMe({ from: alice });
      await this.qvt.requestPower({ from: alice });
      await shouldFail.reverting(this.qvt.deposit(1, 0, { from: alice }));
    });
    it('Can not deposit if voting power input is > user voting power', async () => {
      await this.mip.addMe({ from: alice });
      await this.qvt.requestPower({ from: alice });
      await shouldFail.reverting(this.qvt.deposit(1, 11, { from: alice }));
    });
    it('Can not deposit if pid > number of proposal', async () => {
      await this.mip.addMe({ from: alice });
      await this.qvt.requestPower({ from: alice });
      await shouldFail.reverting(this.qvt.deposit(2, 10, { from: alice }));
    });
    it('should be able to deposit', async () => {
      await this.mip.addMe({ from: alice });
      await this.qvt.requestPower({ from: alice });
      (await this.qvt.powers(alice)).toString().should.eq('10');

      await this.qvt.deposit(1, 10, { from: alice });

      (await this.qvt.powers(alice)).toString().should.eq('1');

      const proposal = await this.qvt.proposals(1);
      proposal.totalStake.toString().should.eq('9');
      proposal.totalVote.toString().should.eq('3');
      proposal.numParticipants.toString().should.eq('1');

      const userStatus = await this.qvt.getUserStatusFromProposal(1, alice);

      userStatus[0].toString().should.eq('9');
      userStatus[1].toString().should.eq('3');
    });
    it('should not be able to deposit again (should with draw first before deposit again)', async () => {
      await this.mip.addMe({ from: alice });
      await this.qvt.setPowerPrivilege(alice, 100, { from: owner });
      (await this.qvt.powers(alice)).toString().should.eq('100');

      await this.qvt.deposit(1, 10, { from: alice });
      await shouldFail.reverting(this.qvt.deposit(1, 20, { from: alice }));
    });
    it('should not be able to withdraw if not deposit first', async () => {
      await this.mip.addMe({ from: alice });
      await this.qvt.requestPower({ from: alice });
      (await this.qvt.powers(alice)).toString().should.eq('10');

      await shouldFail.reverting(this.qvt.withdraw(1, { from: alice }));
    });
    it('should be able to withdraw and then deposit again', async () => {
      await this.mip.addMe({ from: alice });
      await this.qvt.requestPower({ from: alice });
      (await this.qvt.powers(alice)).toString().should.eq('10');

      await this.qvt.deposit(1, 10, { from: alice });

      (await this.qvt.powers(alice)).toString().should.eq('1');

      let proposal = await this.qvt.proposals(1);
      proposal.totalStake.toString().should.eq('9');
      proposal.totalVote.toString().should.eq('3');
      proposal.numParticipants.toString().should.eq('1');

      let userStatus = await this.qvt.getUserStatusFromProposal(1, alice);

      userStatus[0].toString().should.eq('9');
      userStatus[1].toString().should.eq('3');

      await this.qvt.withdraw(1, { from: alice });

      (await this.qvt.powers(alice)).toString().should.eq('10');

      proposal = await this.qvt.proposals(1);
      proposal.totalStake.toString().should.eq('0');
      proposal.totalVote.toString().should.eq('0');
      proposal.numParticipants.toString().should.eq('0');

      userStatus = await this.qvt.getUserStatusFromProposal(1, alice);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
    });
    it('should not be able to withdraw twice', async () => {
      await this.mip.addMe({ from: alice });
      await this.qvt.requestPower({ from: alice });
      (await this.qvt.powers(alice)).toString().should.eq('10');

      await this.qvt.deposit(1, 10, { from: alice });

      (await this.qvt.powers(alice)).toString().should.eq('1');

      let proposal = await this.qvt.proposals(1);
      proposal.totalStake.toString().should.eq('9');
      proposal.totalVote.toString().should.eq('3');
      proposal.numParticipants.toString().should.eq('1');

      let userStatus = await this.qvt.getUserStatusFromProposal(1, alice);

      userStatus[0].toString().should.eq('9');
      userStatus[1].toString().should.eq('3');

      await this.qvt.withdraw(1, { from: alice });

      (await this.qvt.powers(alice)).toString().should.eq('10');

      proposal = await this.qvt.proposals(1);
      proposal.totalStake.toString().should.eq('0');
      proposal.totalVote.toString().should.eq('0');
      proposal.numParticipants.toString().should.eq('0');

      userStatus = await this.qvt.getUserStatusFromProposal(1, alice);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');

      await shouldFail.reverting(this.qvt.withdraw(1, { from: alice }));
    });
  });
  context('Context QVT deposit/withdraw, together', () => {
    beforeEach(async () => {
      await this.mip.addMe({ from: owner });
      await this.mip.addMe({ from: alice });
      await this.mip.addMe({ from: bob });
      await this.mip.addMe({ from: carol });

      await this.qvt.propose('link_owner', 'des_owner', { from: owner });
      await this.qvt.propose('link_alice', 'des_alice', { from: alice });
      await this.qvt.propose('link_bob', 'des_bob', { from: bob });
      await this.qvt.propose('link_carol', 'des_carol', { from: carol });

      for (let i = 0; i < 10; i++) {
        await time.increase(time.duration.seconds(31));
        await this.qvt.requestPower({ from: owner });
        await this.qvt.requestPower({ from: alice });
        await this.qvt.requestPower({ from: bob });
        await this.qvt.requestPower({ from: carol });
      }
    });
    it('Check number of proposal', async () => {
      (await this.qvt.numProposals()).toString().should.eq('5');
    });
    it('Check initial status of proposal', async () => {
      for (let i = 1; i < 5; i++) {
        const proposal = await this.qvt.proposals(i);
        proposal.totalStake.toString().should.eq('0');
        proposal.totalVote.toString().should.eq('0');
        proposal.numParticipants.toString().should.eq('0');
      }
    });
    it('Check voting power of everyone', async () => {
      (await this.qvt.powers(owner)).toString().should.eq('100');
      (await this.qvt.powers(alice)).toString().should.eq('100');
      (await this.qvt.powers(bob)).toString().should.eq('100');
      (await this.qvt.powers(carol)).toString().should.eq('100');
    });
    it('Check voting sequence', async () => {
      await this.qvt.deposit(1, 30, { from: owner });
      await this.qvt.deposit(1, 5, { from: alice });
      await this.qvt.deposit(1, 20, { from: bob });
      await this.qvt.deposit(1, 9, { from: carol });

      (await this.qvt.powers(owner)).toString().should.eq('75');
      (await this.qvt.powers(alice)).toString().should.eq('96');
      (await this.qvt.powers(bob)).toString().should.eq('84');
      (await this.qvt.powers(carol)).toString().should.eq('91');

      let proposal = await this.qvt.proposals(1);
      proposal.totalStake.toNumber().should.eq(25 + 4 + 16 + 9);
      proposal.totalVote.toNumber().should.eq(5 + 2 + 4 + 3);
      proposal.numParticipants.toNumber().should.eq(4);

      await shouldFail.reverting(this.qvt.deposit(1, 4, { from: owner }));
      await shouldFail.reverting(this.qvt.deposit(1, 4, { from: alice }));
      await shouldFail.reverting(this.qvt.deposit(1, 4, { from: bob }));
      await shouldFail.reverting(this.qvt.deposit(1, 4, { from: carol }));

      let userStatus = await this.qvt.getUserStatusFromProposal(1, owner);
      userStatus[0].toString().should.eq('25');
      userStatus[1].toString().should.eq('5');
      userStatus = await this.qvt.getUserStatusFromProposal(1, alice);
      userStatus[0].toString().should.eq('4');
      userStatus[1].toString().should.eq('2');
      userStatus = await this.qvt.getUserStatusFromProposal(1, bob);
      userStatus[0].toString().should.eq('16');
      userStatus[1].toString().should.eq('4');
      userStatus = await this.qvt.getUserStatusFromProposal(1, carol);
      userStatus[0].toString().should.eq('9');
      userStatus[1].toString().should.eq('3');

      // ===============================================================

      await this.qvt.deposit(2, 10, { from: owner });
      await this.qvt.deposit(2, 40, { from: alice });
      await this.qvt.deposit(2, 19, { from: bob });

      (await this.qvt.powers(owner)).toString().should.eq('66');
      (await this.qvt.powers(alice)).toString().should.eq('60');
      (await this.qvt.powers(bob)).toString().should.eq('68');
      (await this.qvt.powers(carol)).toString().should.eq('91');

      proposal = await this.qvt.proposals(2);
      proposal.totalStake.toNumber().should.eq(9 + 36 + 16);
      proposal.totalVote.toNumber().should.eq(3 + 6 + 4);
      proposal.numParticipants.toNumber().should.eq(3);

      await shouldFail.reverting(this.qvt.deposit(2, 1, { from: owner }));
      await shouldFail.reverting(this.qvt.deposit(2, 1, { from: alice }));
      await shouldFail.reverting(this.qvt.deposit(2, 1, { from: bob }));
      await shouldFail.reverting(this.qvt.deposit(2, 0, { from: carol }));
      await shouldFail.reverting(this.qvt.withdraw(2, { from: carol }));

      userStatus = await this.qvt.getUserStatusFromProposal(2, owner);
      userStatus[0].toString().should.eq('9');
      userStatus[1].toString().should.eq('3');
      userStatus = await this.qvt.getUserStatusFromProposal(2, alice);
      userStatus[0].toString().should.eq('36');
      userStatus[1].toString().should.eq('6');
      userStatus = await this.qvt.getUserStatusFromProposal(2, bob);
      userStatus[0].toString().should.eq('16');
      userStatus[1].toString().should.eq('4');
      userStatus = await this.qvt.getUserStatusFromProposal(2, carol);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');

      // ===============================================================

      await this.qvt.deposit(3, 14, { from: bob });
      await this.qvt.deposit(3, 50, { from: carol });

      (await this.qvt.powers(owner)).toString().should.eq('66');
      (await this.qvt.powers(alice)).toString().should.eq('60');
      (await this.qvt.powers(bob)).toString().should.eq('59');
      (await this.qvt.powers(carol)).toString().should.eq('42');

      proposal = await this.qvt.proposals(3);
      proposal.totalStake.toNumber().should.eq(9 + 49);
      proposal.totalVote.toNumber().should.eq(3 + 7);
      proposal.numParticipants.toNumber().should.eq(2);

      await shouldFail.reverting(this.qvt.withdraw(3, { from: owner }));
      await shouldFail.reverting(this.qvt.withdraw(3, { from: alice }));
      await shouldFail.reverting(this.qvt.deposit(3, 9, { from: bob }));
      await shouldFail.reverting(this.qvt.deposit(3, 9, { from: carol }));

      userStatus = await this.qvt.getUserStatusFromProposal(3, owner);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(3, alice);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(3, bob);
      userStatus[0].toString().should.eq('9');
      userStatus[1].toString().should.eq('3');
      userStatus = await this.qvt.getUserStatusFromProposal(3, carol);
      userStatus[0].toString().should.eq('49');
      userStatus[1].toString().should.eq('7');

      // ===============================================================

      await shouldFail.reverting(this.qvt.withdraw(4, { from: owner }));
      await shouldFail.reverting(this.qvt.withdraw(4, { from: alice }));
      await shouldFail.reverting(this.qvt.withdraw(4, { from: bob }));
      await shouldFail.reverting(this.qvt.withdraw(4, { from: carol }));

      await shouldFail.reverting(this.qvt.deposit(4, 0, { from: bob }));
      await this.qvt.deposit(4, 1, { from: bob });

      (await this.qvt.powers(owner)).toString().should.eq('66');
      (await this.qvt.powers(alice)).toString().should.eq('60');
      (await this.qvt.powers(bob)).toString().should.eq('58');
      (await this.qvt.powers(carol)).toString().should.eq('42');

      proposal = await this.qvt.proposals(4);
      proposal.totalStake.toNumber().should.eq(1);
      proposal.totalVote.toNumber().should.eq(1);
      proposal.numParticipants.toNumber().should.eq(1);

      userStatus = await this.qvt.getUserStatusFromProposal(4, owner);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(4, alice);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(4, bob);
      userStatus[0].toString().should.eq('1');
      userStatus[1].toString().should.eq('1');
      userStatus = await this.qvt.getUserStatusFromProposal(4, carol);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');

      await this.qvt.withdraw(4, { from: bob });
      await shouldFail.reverting(this.qvt.withdraw(4, { from: bob }));

      proposal = await this.qvt.proposals(4);
      proposal.totalStake.toNumber().should.eq(0);
      proposal.totalVote.toNumber().should.eq(0);
      proposal.numParticipants.toNumber().should.eq(0);

      (await this.qvt.powers(owner)).toString().should.eq('66');
      (await this.qvt.powers(alice)).toString().should.eq('60');
      (await this.qvt.powers(bob)).toString().should.eq('59');
      (await this.qvt.powers(carol)).toString().should.eq('42');

      userStatus = await this.qvt.getUserStatusFromProposal(4, owner);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(4, alice);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(4, bob);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(4, carol);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');

      // ===============================================================

      await this.qvt.withdraw(3, { from: bob });
      await shouldFail.reverting(this.qvt.withdraw(3, { from: bob }));

      proposal = await this.qvt.proposals(3);
      proposal.totalStake.toNumber().should.eq(49);
      proposal.totalVote.toNumber().should.eq(7);
      proposal.numParticipants.toNumber().should.eq(1);

      userStatus = await this.qvt.getUserStatusFromProposal(3, owner);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(3, alice);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(3, bob);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(3, carol);
      userStatus[0].toString().should.eq('49');
      userStatus[1].toString().should.eq('7');

      await this.qvt.withdraw(3, { from: carol });
      await shouldFail.reverting(this.qvt.withdraw(3, { from: carol }));

      proposal = await this.qvt.proposals(3);
      proposal.totalStake.toNumber().should.eq(0);
      proposal.totalVote.toNumber().should.eq(0);
      proposal.numParticipants.toNumber().should.eq(0);

      userStatus = await this.qvt.getUserStatusFromProposal(3, owner);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(3, alice);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(3, bob);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(3, carol);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');

      (await this.qvt.powers(owner)).toString().should.eq('66');
      (await this.qvt.powers(alice)).toString().should.eq('60');
      (await this.qvt.powers(bob)).toString().should.eq('68');
      (await this.qvt.powers(carol)).toString().should.eq('91');

      // ===============================================================

      await this.qvt.withdraw(2, { from: owner });
      await shouldFail.reverting(this.qvt.withdraw(2, { from: owner }));

      proposal = await this.qvt.proposals(2);
      proposal.totalStake.toNumber().should.eq(36 + 16);
      proposal.totalVote.toNumber().should.eq(6 + 4);
      proposal.numParticipants.toNumber().should.eq(2);

      userStatus = await this.qvt.getUserStatusFromProposal(2, owner);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(2, alice);
      userStatus[0].toString().should.eq('36');
      userStatus[1].toString().should.eq('6');
      userStatus = await this.qvt.getUserStatusFromProposal(2, bob);
      userStatus[0].toString().should.eq('16');
      userStatus[1].toString().should.eq('4');
      userStatus = await this.qvt.getUserStatusFromProposal(2, carol);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');

      await this.qvt.withdraw(2, { from: alice });
      await shouldFail.reverting(this.qvt.withdraw(2, { from: alice }));

      proposal = await this.qvt.proposals(2);
      proposal.totalStake.toNumber().should.eq(16);
      proposal.totalVote.toNumber().should.eq(4);
      proposal.numParticipants.toNumber().should.eq(1);

      userStatus = await this.qvt.getUserStatusFromProposal(2, owner);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(2, alice);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(2, bob);
      userStatus[0].toString().should.eq('16');
      userStatus[1].toString().should.eq('4');
      userStatus = await this.qvt.getUserStatusFromProposal(2, carol);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');

      await this.qvt.withdraw(2, { from: bob });
      await shouldFail.reverting(this.qvt.withdraw(2, { from: bob }));

      proposal = await this.qvt.proposals(2);
      proposal.totalStake.toNumber().should.eq(0);
      proposal.totalVote.toNumber().should.eq(0);
      proposal.numParticipants.toNumber().should.eq(0);

      userStatus = await this.qvt.getUserStatusFromProposal(2, owner);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(2, alice);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(2, bob);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(2, carol);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');

      (await this.qvt.powers(owner)).toString().should.eq('75');
      (await this.qvt.powers(alice)).toString().should.eq('96');
      (await this.qvt.powers(bob)).toString().should.eq('84');
      (await this.qvt.powers(carol)).toString().should.eq('91');

      // ===============================================================

      await this.qvt.withdraw(1, { from: owner });
      await shouldFail.reverting(this.qvt.withdraw(1, { from: owner }));

      proposal = await this.qvt.proposals(1);
      proposal.totalStake.toNumber().should.eq(4 + 16 + 9);
      proposal.totalVote.toNumber().should.eq(2 + 4 + 3);
      proposal.numParticipants.toNumber().should.eq(3);

      userStatus = await this.qvt.getUserStatusFromProposal(1, owner);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(1, alice);
      userStatus[0].toString().should.eq('4');
      userStatus[1].toString().should.eq('2');
      userStatus = await this.qvt.getUserStatusFromProposal(1, bob);
      userStatus[0].toString().should.eq('16');
      userStatus[1].toString().should.eq('4');
      userStatus = await this.qvt.getUserStatusFromProposal(1, carol);
      userStatus[0].toString().should.eq('9');
      userStatus[1].toString().should.eq('3');

      await this.qvt.withdraw(1, { from: alice });
      await shouldFail.reverting(this.qvt.withdraw(1, { from: alice }));

      proposal = await this.qvt.proposals(1);
      proposal.totalStake.toNumber().should.eq(16 + 9);
      proposal.totalVote.toNumber().should.eq(4 + 3);
      proposal.numParticipants.toNumber().should.eq(2);

      userStatus = await this.qvt.getUserStatusFromProposal(1, owner);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(1, alice);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(1, bob);
      userStatus[0].toString().should.eq('16');
      userStatus[1].toString().should.eq('4');
      userStatus = await this.qvt.getUserStatusFromProposal(1, carol);
      userStatus[0].toString().should.eq('9');
      userStatus[1].toString().should.eq('3');

      await this.qvt.withdraw(1, { from: bob });
      await shouldFail.reverting(this.qvt.withdraw(1, { from: bob }));

      proposal = await this.qvt.proposals(1);
      proposal.totalStake.toNumber().should.eq(9);
      proposal.totalVote.toNumber().should.eq(3);
      proposal.numParticipants.toNumber().should.eq(1);

      userStatus = await this.qvt.getUserStatusFromProposal(1, owner);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(1, alice);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(1, bob);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(1, carol);
      userStatus[0].toString().should.eq('9');
      userStatus[1].toString().should.eq('3');

      await this.qvt.withdraw(1, { from: carol });
      await shouldFail.reverting(this.qvt.withdraw(1, { from: carol }));

      proposal = await this.qvt.proposals(1);
      proposal.totalStake.toNumber().should.eq(0);
      proposal.totalVote.toNumber().should.eq(0);
      proposal.numParticipants.toNumber().should.eq(0);

      userStatus = await this.qvt.getUserStatusFromProposal(1, owner);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(1, alice);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(1, bob);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');
      userStatus = await this.qvt.getUserStatusFromProposal(1, carol);
      userStatus[0].toString().should.eq('0');
      userStatus[1].toString().should.eq('0');

      (await this.qvt.powers(owner)).toString().should.eq('100');
      (await this.qvt.powers(alice)).toString().should.eq('100');
      (await this.qvt.powers(bob)).toString().should.eq('100');
      (await this.qvt.powers(carol)).toString().should.eq('100');
    });
  });
});
