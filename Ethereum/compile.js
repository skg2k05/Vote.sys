const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

const buildPath = path.resolve(__dirname, 'Build');
fs.removeSync(buildPath); //deletes the build folder

const contractPath = path.resolve(__dirname, 'Contract', 'Election.sol');
const source = fs.readFileSync(contractPath, 'utf-8');

const input = {
	language: 'Solidity',
	sources: {
		'Election.sol': {
			content: source,
		},
	},
	settings: {
		outputSelection: {
			'*': {
				'*': ['abi', 'evm.bytecode.object'],
			},
		},
	},
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

const errors = (output.errors || []).filter(error => error.severity === 'error');
if (errors.length) {
	errors.forEach(error => console.error(error.formattedMessage));
	process.exit(1);
}

fs.ensureDirSync(buildPath); //checks if exists; if doesn't, create one

const contracts = output.contracts['Election.sol'];

for (let name in contracts) {
	const artifact = {
		interface: JSON.stringify(contracts[name].abi),
		bytecode: contracts[name].evm.bytecode.object,
	};
	fs.outputJsonSync(path.resolve(buildPath, name + '.json'), artifact);
	console.log('Compiled', name);
}
