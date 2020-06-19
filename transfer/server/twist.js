const fetch = require('node-fetch');
const configs = require('./configs');

async function CreateTask(task) {

	try {
		let res = await fetch(configs.twistHost + '/api/v1/tasks', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				task: task,
			})
		});

		let data = await res.json();

		return data;

	} catch(e) {
		throw e;
	}
}

async function GetTask(taskID) {

	try {
		let res = await fetch(configs.twistHost + '/api/v1/tasks/' + taskID, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});

		let data = await res.json();

		return data;

	} catch(e) {
		throw e;
	}
}

async function CancelTask(taskID) {

	try {
		let res = await fetch(configs.twistHost + '/api/v1/tasks/' + taskID, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			}
		});

		let data = await res.json();

		return data;

	} catch(e) {
		throw e;
	}
}

module.exports = {
	CreateTask: CreateTask,
	GetTask: GetTask,
	CancelTask: CancelTask,
};
