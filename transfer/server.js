const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser')

const app = new Koa();

app.use(bodyParser())
/*
// Logging
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});
*/
// Load APIs
const deduct = require('./task-deduct');
const deposit = require('./task-deposit');

const api = new Router({
	prefix: '/api'
})

const Data = require('./Data');
api.get('/wallet', async (ctx, next) => {
	ctx.body = Data.wallet;
});

app
	.use(api.routes())
	.use(api.allowedMethods())
	.use(deduct.routes())
	.use(deduct.allowedMethods())
	.use(deposit.routes())
	.use(deposit.allowedMethods())

app.listen(3000);
