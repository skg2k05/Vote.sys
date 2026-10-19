import Web3 from 'web3';

const LOCAL_RPC_URL = 'http://127.0.0.1:8545';

let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
	web3 = new Web3(window.ethereum);
} else if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
	web3 = new Web3(window.web3.currentProvider);
} else {
	web3 = new Web3(new Web3.providers.HttpProvider(LOCAL_RPC_URL));
}

export async function getAccounts() {
	try {
		if (typeof window !== 'undefined' && window.ethereum && web3.eth.requestAccounts) {
			return await web3.eth.requestAccounts();
		}
	} catch (err) {
		console.log('Account request rejected:', err.message);
	}
	return web3.eth.getAccounts();
}

export async function sendTx(method, options = {}) {
	if (options.from && !options.gas && !options.gasLimit) {
		try {
			const gas = await method.estimateGas({ from: options.from });
			options = { ...options, gas: Math.ceil(gas * 1.2) };
		} catch (err) {
			try {
				await method.call({ from: options.from });
			} catch (callErr) {
				throw new Error(callErr.message);
			}
			throw err;
		}
	}
	return method.send(options);
}

export default web3;
