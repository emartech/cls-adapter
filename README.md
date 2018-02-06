# cls-adapter

Wrapper around [cls-hooked](https://github.com/Jeff-Lewis/cls-hooked) for easier access.

The aim is to store the unique request identifier from the header (X-Request-Id) 
and make it available on any function call that is after the middleware during a request lifecycle.
This way at any point of the application we can retrieve the request identifier from the storage without having to pass it down to every function call.
We can even add more information to the storage besides the request identifier and access it in consecutive function calls.

### Basic usage

```javascript
// Add middleware to Koa app
const Koa = require('koa');
const clsAdapter = require('@emartech/cls-adapter');
const port = 3000;

const app = new Koa();

app.use(clsAdapter.getKoaMiddleware());

app.use(async (ctx) => {
  clsAdapter.setOnContext('customer_id', Math.round(Math.random() * 1000));

  // will return an object with request_id and customer_id property set
  console.log(clsAdapter.getContextStorage());

  ctx.body = 'It works';
});

app.listen(port);
console.log('listening on port: ' + port);

```
