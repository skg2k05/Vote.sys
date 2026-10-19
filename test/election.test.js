const ganache = require('ganache');
const Web3 = require('web3');
const assert = require('assert');
const factoryArtifact = require('../Ethereum/Build/ElectionFact.json');
const electionArtifact = require('../Ethereum/Build/Election.json');

const MNEMONIC = 'myth like bonus scare over problem client lizard pioneer submit female collect';
const FACTORY_GAS = '6000000';
const TX_GAS = '3000000';
const VOTE_GAS = '500000';

describe('Election smart contracts', function () {
	this.timeout(60000);

	let web3;
	let accounts;
	let factory;
	let election;
	let email;

	before(async () => {
		const provider = ganache.provider({
			logging: { quiet: true },
			chain: { chainId: 1337 },
			wallet: { mnemonic: MNEMONIC, totalAccounts: 10, defaultBalance: 1000 },
		});
		web3 = new Web3(provider);
		web3.eth.handleRevert = true;
		accounts = await web3.eth.getAccounts();

		factory = await new web3.eth.Contract(JSON.parse(factoryArtifact.interface))
			.deploy({ data: '0x' + factoryArtifact.bytecode })
			.send({ from: accounts[0], gas: FACTORY_GAS });
	});

	beforeEach(async () => {
		email = 'company' + Date.now() + Math.random().toFixed(5) + '@example.com';
		await factory.methods
			.createElection(email, 'Test Election', 'Test description')
			.send({ from: accounts[0], gas: TX_GAS });
		const summary = await factory.methods.getDeployedElection(email).call();
		election = new web3.eth.Contract(JSON.parse(electionArtifact.interface), summary[0]);
	});

	it('stores the election details', async () => {
		const summary = await election.methods.getElectionDetails().call();
		assert.equal(summary[0], 'Test Election');
		assert.equal(summary[1], 'Test description');
	});

	it('prevents creating a second election for the same e-mail', async () => {
		await assert.rejects(
			factory.methods.createElection(email, 'Second', 'Nope').send({ from: accounts[0], gas: TX_GAS }),
			/reverted/
		);
		await assert.rejects(
			factory.methods.createElection(email, 'Second', 'Nope').call({ from: accounts[0] }),
			/already exists/
		);
	});

	it('lets only the election authority add candidates', async () => {
		await election.methods
			.addCandidate('Alice', 'desc', 'img', 'alice@example.com')
			.send({ from: accounts[0], gas: TX_GAS });
		assert.equal(await election.methods.getNumOfCandidates().call(), '1');

		await assert.rejects(
			election.methods
				.addCandidate('Bob', 'desc', 'img', 'bob@example.com')
				.send({ from: accounts[1], gas: TX_GAS }),
			/reverted/
		);
		await assert.rejects(
			election.methods.addCandidate('Bob', 'desc', 'img', 'bob@example.com').call({ from: accounts[1] }),
			/Access Denied/
		);
	});

	it('lets only the election authority whitelist voters', async () => {
		await assert.rejects(
			election.methods.addVoter(accounts[1]).send({ from: accounts[1], gas: VOTE_GAS }),
			/reverted/
		);
		await assert.rejects(election.methods.addVoter(accounts[1]).call({ from: accounts[1] }), /Access Denied/);

		await election.methods.addVoter(accounts[1]).send({ from: accounts[0], gas: VOTE_GAS });
		assert.equal(await election.methods.registeredVoters(accounts[1]).call(), true);
	});

	it('rejects votes from wallets that are not whitelisted', async () => {
		await election.methods
			.addCandidate('Alice', 'desc', 'img', 'alice@example.com')
			.send({ from: accounts[0], gas: TX_GAS });

		await assert.rejects(election.methods.vote(0).send({ from: accounts[2], gas: VOTE_GAS }), /reverted/);
		await assert.rejects(election.methods.vote(0).call({ from: accounts[2] }), /not a registered voter/);
	});

	it('records a vote and emits the VoteCast event', async () => {
		await election.methods
			.addCandidate('Alice', 'desc', 'img', 'alice@example.com')
			.send({ from: accounts[0], gas: TX_GAS });
		await election.methods.addVoter(accounts[1]).send({ from: accounts[0], gas: VOTE_GAS });

		const receipt = await election.methods.vote(0).send({ from: accounts[1], gas: VOTE_GAS });
		assert.equal(receipt.events.VoteCast.returnValues.voter.toLowerCase(), accounts[1].toLowerCase());
		assert.equal(receipt.events.VoteCast.returnValues.candidateID, '0');
		assert.equal(await election.methods.getNumOfVoters().call(), '1');

		const candidate = await election.methods.getCandidate(0).call();
		assert.equal(candidate[3], '1');
	});

	it('prevents double voting', async () => {
		await election.methods
			.addCandidate('Alice', 'desc', 'img', 'alice@example.com')
			.send({ from: accounts[0], gas: TX_GAS });
		await election.methods
			.addCandidate('Bob', 'desc', 'img', 'bob@example.com')
			.send({ from: accounts[0], gas: TX_GAS });
		await election.methods.addVoter(accounts[1]).send({ from: accounts[0], gas: VOTE_GAS });
		await election.methods.vote(0).send({ from: accounts[1], gas: VOTE_GAS });

		await assert.rejects(election.methods.vote(1).send({ from: accounts[1], gas: VOTE_GAS }), /reverted/);
		await assert.rejects(election.methods.vote(1).call({ from: accounts[1] }), /double vote/);
	});

	it('ends the election, announces the winner and stops new votes', async () => {
		await election.methods
			.addCandidate('Alice', 'desc', 'img', 'alice@example.com')
			.send({ from: accounts[0], gas: TX_GAS });
		await election.methods
			.addCandidate('Bob', 'desc', 'img', 'bob@example.com')
			.send({ from: accounts[0], gas: TX_GAS });
		await election.methods.addVoter(accounts[1]).send({ from: accounts[0], gas: VOTE_GAS });
		await election.methods.addVoter(accounts[2]).send({ from: accounts[0], gas: VOTE_GAS });
		await election.methods.vote(1).send({ from: accounts[1], gas: VOTE_GAS });
		await election.methods.vote(1).send({ from: accounts[2], gas: VOTE_GAS });

		const receipt = await election.methods.endElection().send({ from: accounts[0], gas: VOTE_GAS });
		assert.equal(receipt.events.ElectionEnded.returnValues.winnerCandidateID, '1');
		assert.equal(await election.methods.status().call(), false);
		assert.equal(await election.methods.winnerCandidate().call(), '1');

		await assert.rejects(election.methods.vote(0).send({ from: accounts[2], gas: VOTE_GAS }), /reverted/);
		await assert.rejects(election.methods.vote(0).call({ from: accounts[2] }), /Election has ended/);
	});
});
