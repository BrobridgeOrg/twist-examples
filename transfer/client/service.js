const fetch = require('node-fetch');
const configs = require('./configs');

async function printWalletInfo() {

	try {
		let res = await fetch(configs.serviceHost + '/api/v1/wallets');
		let data = await res.json();
		console.log('');
		console.log('wallet:', data);
		console.log('');
	} catch(e) {
		console.log('Failed to get wallet information');
		console.log(e);
	}
}

module.exports = {
	printWalletInfo: printWalletInfo,
}
