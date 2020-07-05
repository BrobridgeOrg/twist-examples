const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser')
const Data = require('./data');

const app = new Koa();

app.use(async (ctx, next) => {
	res = await next();

	console.log(ctx.response.status, ctx.request.method, ctx.request.url);
})
app.use(bodyParser())

// Load APIs
const deduct = require('./task-deduct');
const deposit = require('./task-deposit');

const api = new Router({
	prefix: '/api/v1'
})

app
	.use(api.routes())
	.use(api.allowedMethods())
	.use(deduct.routes())
	.use(deduct.allowedMethods())
	.use(deposit.routes())
	.use(deposit.allowedMethods())

// Wallet information
api.get('/wallets', async (ctx, next) => {
	ctx.body = Data.accounts;
});

app.listen(3000);
