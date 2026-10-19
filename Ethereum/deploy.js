const fs = require('fs-extra');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const Web3 = require('web3');
const eF = require('./Build/ElectionFact.json');

const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const MNEMONIC = process.env.MNEMONIC;

const deploy = async () => {
	let web3;

	if (MNEMONIC) {
		const HDWalletProvider = require('truffle-hdwallet-provider');
		web3 = new Web3(new HDWalletProvider(MNEMONIC, RPC_URL));
	} else {
		web3 = new Web3(RPC_URL);
	}

	const accounts = await web3.eth.getAccounts();
	console.log('Deploying to', RPC_URL, 'from account', accounts[0]);

	const result = await new web3.eth.Contract(JSON.parse(eF.interface))
		.deploy({ data: '0x' + eF.bytecode })
		.send({ gas: '3000000', from: accounts[0] });

	console.log('ElectionFact deployed to:', result.options.address);

	fs.outputJsonSync(path.resolve(__dirname, 'deployed_address.json'), { address: result.options.address });
	console.log('Address saved to Ethereum/deployed_address.json');
};

deploy().catch(err => {
	console.error(err.message);
	process.exit(1);
});
