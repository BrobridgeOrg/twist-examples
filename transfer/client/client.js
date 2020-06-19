const fetch = require('node-fetch');

// modules
const twist = require('./twist');
const tryTasks = require('./try');
const service = require('./service');

// Entry point
(async () => {

	console.log('==========', 'ORIGINAL', '==========');

	await service.printWalletInfo();

	console.log('*** CREATE TRANSACTION ***');

	let transactionID;
	try {
		// Create a new transaction with timeout parameter
		transactionID = await twist.createTransaction(3000);

		console.log('Created transaction: ' + transactionID);
	} catch(e) {
		console.log('Cannot create a transaction');
		console.error(e);
		return;
	}

	console.log('');

	// TRY
	try {
		console.log('*** TRY ***');

		// Call deduct API and register task on coordinator
		let deductTask = await tryTasks.deduct(transactionID);
		await twist.registerTasks(transactionID, deductTask);

		// Call deposit API and register task on coordinator
		let depositTask = await tryTasks.deposit(transactionID);
		await twist.registerTasks(transactionID, depositTask);

	} catch(e) {
		console.log('Failed to try, so cancel all of them');
		console.log(e);

		// Notify coordinator to cancel transaction
		await twist.doCancel(transactionID);
		return;
	}

	console.log('');

	// CONFIRM
	try {
		console.log('*** CONFIRM ***');

		await twist.doConfirm(transactionID);
	} catch(e) {
		console.log('Failed to confirm');
		return;
	}

	console.log('');
	console.log('==========', 'RESULTS', '==========');

	await service.printWalletInfo();

	console.log('*** Transaction was successfully processed ***');
})()
