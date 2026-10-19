import web3 from './web3';
import ElectionFactory from './Build/ElectionFact.json';
import deployed from './deployed_address.json';

const instance = deployed.address
	? new web3.eth.Contract(JSON.parse(ElectionFactory.interface), deployed.address)
	: null;

export default instance;
