const Router = require('koa-router');
const Data = require('./Data');
const TaskState = require('./task-state');

const serviceHost = 'http://127.0.0.1:3000';

const router = module.exports = new Router({
	prefix: '/api/v1'
});

router.post('/deposit', async (ctx, next) => {

	switch(ctx.headers['twist-phrase']) {
		case 'confirm':

			console.log('CONFIRM');
			if (!ctx.headers['twist-task-id']) {
				ctx.throw(400, 'Required task ID');
			}

			try {
				// Getting task state
				let task = await TaskState.GetTask(ctx.headers['twist-task-id']);
				let taskState = JSON.parse(task.payload);

				// Execute
				let user = Data.accounts[taskState.user];
				user.balance += taskState.balance;

				// Response
				ctx.body = {
					user: taskState.user,
					wallet: user.balance,
				};

			} catch(e) {
				console.log(e);
				ctx.throw(404)
			}

			break;

		case 'cancel':

			console.log('CANCEL');
			if (!ctx.headers['twist-task-id']) {
				ctx.throw(400, 'Required task ID');
			}

			try {
				// Getting task state
				let task = await TaskState.GetTask(ctx.headers['twist-task-id']);
				let taskState = JSON.parse(task.payload);

				// rollback if confirmed already
				if (task.status === 'CONFIRMED') {
					let user = Data.accounts[taskState.user];
					user.balance -= taskState.balance;
				}

				// Cancel task
				await TaskState.CancelTask(ctx.headers['twist-task-id']);

			} catch(e) {
				console.log(e);
				ctx.throw(404)
			}

			ctx.body = {};
			break;

		default:

			console.log('TRY');

			if (!ctx.request.body.user) {
				ctx.throw(400, 'Required user');
			}

			if (!ctx.request.body.balance && ctx.request.body.balance > 0) {
				ctx.throw(400, 'Required balance');
			}

			// Prepare a task
			let taskState = {
				user: ctx.request.body.user,
				balance: ctx.request.body.balance,
			};

			// Check user
			let user = Data.accounts[taskState.user];
			if (!user) {
				ctx.throw(400, 'no such user');
			}

			// Create task to manage lifecycle and state of this task
			let taskResponse;
			try {
				taskResponse = await TaskState.CreateTask({

					// Actions for confirm and cancel
					actions: {
						confirm: {
							type: 'rest',
							method: 'post',
							uri: serviceHost + '/api/v1/deposit'
						},
						cancel: {
							type: 'rest',
							method: 'post',
							uri: serviceHost + '/api/v1/deposit'
						}
					},
					payload: JSON.stringify(taskState)
				})
			} catch(e) {
				console.log(e)
				ctx.throw(500, 'Failed to create task state')
			}

			// Response
			ctx.body = taskResponse;
	}
});
