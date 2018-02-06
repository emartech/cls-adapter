'use strict';

const Koa = require('koa');
const contextFactory = require('../src/context-factory/context-factory');
const port = 3000;

const app = new Koa();

app.use(contextFactory.getKoaMiddleware());

app.use(async (ctx) => {
  contextFactory.setOnContext('customer_id', Math.round(Math.random() * 1000));

  console.log(contextFactory.getContextStorage());

  ctx.body = 'It works';
});

app.listen(port);
console.log('listening on port: ' + port);
