const Router = require('koa-router');
const Data = require('./Data');

const serviceHost = 'http://127.0.0.1:3000';

const router = module.exports = new Router({
	prefix: '/api'
});

// Try
router.post('/deposit', async (ctx, next) => {

	if (!ctx.headers['twist-transaction-id']) {
		ctx.throw(400, 'Required transaction ID');
	}

	if (!ctx.request.body.user) {
		ctx.throw(400, 'Required user');
	}

	if (!ctx.request.body.balance && ctx.request.body.balance > 0) {
		ctx.throw(400, 'Required balance');
	}

	// Prepare a transaction
	let transaction = {
		id: ctx.headers['twist-transaction-id'],
		user: ctx.request.body.user,
		balance: ctx.request.body.balance,
		status: 'TRY',
	};

	// Check user
	if (!Data.wallet.hasOwnProperty(transaction.user)) {
		ctx.throw(400, 'no such user');
	}

	// Store this transaction record
	Data.transactions.deposit[transaction.id] = transaction

	// TODO: set up timer for timeout mechanism

	// Response
	ctx.body = {
		transactionID: transaction.id,
		actions: {
			confirm: {
				type: 'rest',
				method: 'put',
				uri: serviceHost + '/api/deposit'
			},
			cancel: {
				type: 'rest',
				method: 'delete',
				uri: serviceHost + '/api/deposit'
			}
		},
		expires: Date.now() + (30 * 1000), // should be done in 30 seconds
	};
});

// Confirm
router.put('/deposit', async (ctx, next) => {

	if (!ctx.headers['twist-transaction-id']) {
		ctx.throw(400, 'Required transaction ID');
	}

	// Get this transaction information from Database
	let transaction = Data.transactions.deposit[ctx.headers['twist-transaction-id']];
	if (!transaction) {
		ctx.throw(400, 'No such transaction')
	}

	// Pre-confirm phase
	if (ctx.request.body.phase == 'pre-confirm') {

		// Do nothing if not in the right phase
		if (transaction.status != 'TRY') {
			ctx.throw(202)
		}

		// Update transaction status
		transaction.status = 'PRE-CONFIRM';

		// TODO: Set up a timer for this tranasction

		ctx.body = {
			transactionID: transaction.id,
		};

		return;
	}

	// Do nothing if not in the right phase
	if (transaction.status != 'PRE-CONFIRM') {
		ctx.throw(202)
	}

	// TODO: stop timer

	// Update transaction status
	transaction.status = 'CONFIRM';

	// Execute
	Data.wallet[transaction.user] += transaction.balance;

	// Update transaction status
	transaction.status = 'SUCCESS';

	ctx.body = {
		transactionID: transaction.id,
		user: transaction.user,
		wallet: Data.wallet[transaction.user]
	};
});

// Cancel
router.delete('/deposit', async (ctx, next) => {

	if (!ctx.headers['twist-transaction-id']) {
		ctx.throw(400, 'Required transaction ID');
	}

	// Get this transaction information from Database
	let transaction = Data.transactions.deposit[ctx.headers['twist-transaction-id']];
	if (!transaction) {
		ctx.throw(400, 'No such transaction')
	}

	if (transaction.status == 'PRE-CONFIRM') {
		// TODO: stop timer

		// update transaction status
		transaction.status = 'CANCELED';
	} else if (transaction.status == 'TRY') {
		// update transaction status
		transaction.status = 'CANCELED';
	} else {
		ctx.throw(400, 'Transaction cannot be canceled');
	}

	ctx.body = {};
});
