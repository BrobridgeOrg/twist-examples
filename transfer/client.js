const fetch = require('node-fetch');

const twistHost = 'http://127.0.0.1:45555';
const serviceHost = 'http://127.0.0.1:3000';

const tasks = [];

async function createTransaction() {

	// Create a transaction
	let res = await fetch(twistHost + '/api/transactions', {
		method: 'POST'
	});

	let data = await res.json()

	return data.transactionID;
}

async function doTry(transactionID) {

	console.log('Entering TRY phase ...');

	// Debit
	try {
		console.log('  *', 'deduct 100 from fred')
		let res = await fetch(serviceHost + '/api/deduct', {
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

		let data = await res.json();
		let task = {
			actions: data.actions,
			expires: data.expires
		}

		tasks.push(task);
	} catch(e) {
		console.log('failed to do try task: deduct');
		throw e;
	}

	// Credit
	try {
		console.log('  *', 'deposit 100 to armani\'s wallet')
		let res = await fetch(serviceHost + '/api/deposit', {
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

		let data = await res.json();
		let task = {
			actions: data.actions,
			expires: data.expires
		}

		tasks.push(task);
	} catch(e) {
		console.log('failed to do try task: deposit');
		throw e;
	}
}

async function registerTasks(transactionID, tasks) {

	console.log('Register taskss ...');

	let res = await fetch(twistHost + '/api/transactions/' + transactionID, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			tasks: tasks,
		})
	});

	let data = await res.json();
	if (!data.success)
		throw new Error('Failed to register');
}

async function doConfirm(transactionID) {

	console.log('Entering CONFIRM phase ...');

	let res = await fetch(twistHost + '/api/transactions/' + transactionID, {
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

	console.log('Entering Cancel phase');

	let res = await fetch(twistHost + '/api/transactions/' + transactionID, {
		method: 'DELETE'
	});

	let data = await res.json();
	if (!data.success)
		throw new Error('Failed to cancel');

	console.log('Transaction was canceled successfully');
}

async function getWalletInfo() {

	let res = await fetch(serviceHost + '/api/wallet');
	let data = await res.json();

	return data;
}

(async () => {

	// Get wallets
	try {
		let wallet = await getWalletInfo()
		console.log('wallet:', wallet);
	} catch(e) {
		console.log('Failed to get wallet information');
		return;
	}

	let transactionID;
	try {
		transactionID = await createTransaction();

		console.log('Created transaction: ' + transactionID);
	} catch(e) {
		console.log('Cannot create a transaction');
		console.error(e);
		return;
	}

	// TRY
	try {
		await doTry(transactionID);
	} catch(e) {
		console.log('Failed to try, so cancel all');
		await doCancel(transactionID);
		return;
	}

	// Register tasks
	try {
		await registerTasks(transactionID, tasks);
	} catch(e) {
		console.log('Failed to register tasks');
		return;
	}

	// CONFIRM
	try {
		await doConfirm(transactionID);
	} catch(e) {
		console.log('Failed to confirm');
		return;
	}

	console.log('Transaction was successful');

	// Get wallets
	try {
		let wallet = await getWalletInfo()
		console.log('wallet:', wallet);
	} catch(e) {
		console.log('Failed to get wallet information');
		return;
	}
})()
