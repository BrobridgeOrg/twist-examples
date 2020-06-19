const fetch = require('node-fetch');
const configs = require('./configs');

async function deduct(transactionID) {

	console.log('[TRY]', 'deduct 100 from fred')

	try {
		let res = await fetch(configs.serviceHost + '/api/v1/deduct', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Twist-Transaction-ID': transactionID,
			},
			body: JSON.stringify({
				user: 'fred',
				balance: 100
			})
		});

		return  await res.json();

	} catch(e) {
		console.log('failed to do try task: deduct');
		throw e;
	}
}

async function deposit(transactionID) {

	console.log('[TRY]', 'deposit 100 to armani\'s wallet')

	try {
		let res = await fetch(configs.serviceHost + '/api/v1/deposit', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Twist-Transaction-ID': transactionID,
			},
			body: JSON.stringify({
				user: 'armani',
				balance: 100
			})
		});

		return await res.json();

	} catch(e) {
		console.log('failed to do try task: deposit');
		throw e;
	}
}

module.exports = {
	deduct: deduct,
	deposit: deposit,
};
