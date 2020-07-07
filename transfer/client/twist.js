const fetch = require('node-fetch');
const configs = require('./configs');

async function createTransaction(timeout) {

	// Create a transaction
	let res = await fetch(configs.twistHost + '/api/v1/transactions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			timeout: timeout,
		})
	});

	let data = await res.json()

	return data.transactionID;
}

async function registerTasks(transactionID, task) {

	console.log('Register tasks:', transactionID);

	let res = await fetch(configs.twistHost + '/api/v1/transactions/' + transactionID, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			tasks: [ task ],
		})
	});

	let data = await res.json();
	if (!data.success)
		throw new Error('Failed to register');
}

async function doConfirm(transactionID) {

	console.log('Entering CONFIRM phase for:', transactionID);

	let res = await fetch(configs.twistHost + '/api/v1/transactions/' + transactionID, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
		})
	});

	let data = await res.json();
	if (!data.success)
		throw new Error('Failed to confirm');
}

async function doCancel(transactionID) {

	console.log('Entering Cancel phase for:', transactionID);

	let res = await fetch(configs.twistHost + '/api/v1/transactions/' + transactionID, {
		method: 'DELETE'
	});

	let data = await res.json();
	if (!data.success)
		throw new Error('Failed to cancel');

	console.log('Transaction was canceled successfully');
}

module.exports = {
	createTransaction: createTransaction,
	registerTasks: registerTasks,
	doConfirm: doConfirm,
	doCancel: doCancel,
};
