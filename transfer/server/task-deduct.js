const Router = require('koa-router');
const Data = require('./data');
const Twist = require('./twist');

const configs = require('./configs');

const router = module.exports = new Router({
	prefix: '/api/v1'
});

// Try
router.post('/deduct', async (ctx, next) => {

	if (!ctx.request.body.user) {
		ctx.throw(400, 'Required user');
	}

	if (!ctx.request.body.balance) {
		ctx.throw(400, 'Required balance');
	}

	// Prepare a task state
	let taskState = {
		user: ctx.request.body.user,
		balance: ctx.request.body.balance,
	};

	// Check user whether does exists or not
	let user = Data.accounts[taskState.user];
	if (!user) {
		ctx.throw(400, 'no such user');
	}

	// Check balances
	if (user.balance - user.reserved < taskState.balance) {
		ctx.throw(400, 'Balance in wallet is not engough');
	}

	// Do reserved
	user.reserved += taskState.balance;

	// Create task to manage lifecycle and state of this task
	let taskResponse;
	try {
		taskResponse = await Twist.CreateTask({

			// Actions for confirm and cancel
			actions: {
				confirm: {
					type: 'rest',
					method: 'put',
					uri: configs.serviceHost + '/api/v1/deduct'
				},
				cancel: {
					type: 'rest',
					method: 'delete',
					uri: configs.serviceHost + '/api/v1/deduct'
				}
			},
			payload: JSON.stringify(taskState),
			timeout: 30000,
		})
	} catch(e) {
		console.log(e)
		ctx.throw(500, 'Failed to create task state')
	}

	// Response
	ctx.body = taskResponse;
});

// Confirm
router.put('/deduct', async (ctx, next) => {

	if (!ctx.headers['twist-task-id']) {
		ctx.throw(400, 'Required task ID');
	}

	try {
		// Getting task state
		let task = await Twist.GetTask(ctx.headers['twist-task-id']);
		let taskState = JSON.parse(task.payload);

		// Execute to update database
		let user = Data.accounts[taskState.user];
		user.balance -= taskState.balance;
		user.reserved -= taskState.balance;

		// Response
		ctx.body = {
			user: taskState.user,
			wallet: user.balance,
		};

	} catch(e) {
		ctx.throw(404)
	}
});

// Cancel
router.delete('/deduct', async (ctx, next) => {

	if (!ctx.headers['twist-task-id']) {
		ctx.throw(400, 'Required task ID');
	}

	try {
		// Getting task state
		let task = await Twist.GetTask(ctx.headers['twist-task-id']);
		let taskState = JSON.parse(task.payload);
		let user = Data.accounts[taskState.user];

		if (task.status == 'CONFIRMED') {
			// rollback if confirmed already
			user.balance += taskState.balance;
		} else {
			// release reserved resources
			user.reserved -= taskState.balance;
		}

	} catch(e) {
		ctx.throw(404)
	}

	ctx.body = {};
});
