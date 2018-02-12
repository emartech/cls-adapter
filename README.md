# @emartech/cls-adapter

A wrapper around the Continuation Local Storage library [cls-hooked](https://github.com/Jeff-Lewis/cls-hooked).
Makes storing and retrieving of context dependent information easier.
It acts as a thread aware storage.

When a value is set on the storage with a given key,
that value will be available inside functions calls from the parent function.

### Installation

```bash
npm install @emartech/cls-adapter
```

### Usage

```javascript
const Koa = require('koa');
const ClsAdapter = require('@emartech/cls-adapter');

const logWithStorage = (message) => {
  console.log(Object.assign({ message }, ClsAdapter.getContextStorage()));
};
const calculationResult = () => {
  logWithStorage(100);
};

const app = new Koa();
app.use(ClsAdapter.getKoaMiddleware());

app.use(async (ctx) => {
  ClsAdapter.setOnContext('customer_id', 1000);

  logWithStorage('works');
  // { message: 'works', request_id: 'd5caaa0e-b04e-4d94-bc88-3ed3b62dc94a' }
  
  calculationResult();
  // { message: 100, request_id: 'd5caaa0e-b04e-4d94-bc88-3ed3b62dc94a' }

  ctx.body = 'It works';
});

app.listen(3000);

```

### API

#### ClsAdapter.getKoaMiddleware()

Returns a middleware function compatible with Koa that stores (or generates if missing) 
the request identifier from the header (X-Request-Id) and sets it on the storage as `request_id`.

```javascript
const app = new Koa();
app.use(ClsAdapter.getKoaMiddleware());

app.use(async () => {
  ClsAdapter.getContextStorage();
  // { request_id: 'd5caaa0e-b04e-4d94-bc88-3ed3b62dc94a' }
});
```

#### ClsAdapter.getExpressMiddleware()

Returns a middleware function compatible with Express that stores (or generates if missing) 
the request identifier from the header (X-Request-Id) and sets it on the storage as `request_id`.

```javascript
const app = express();
app.use(ClsAdapter.getExpressMiddleware());

app.use(() => {
  ClsAdapter.getContextStorage();
  // { request_id: 'd5caaa0e-b04e-4d94-bc88-3ed3b62dc94a' }
});
```

#### ClsAdapter.getContextStorage()

Returns the all the values set on the storage.

#### ClsAdapter.setOnContext(key, value)

Sets a key with a given value on the storage.

```javascript
ClsAdapter.setOnContext('customer_id', 1);

ClsAdapter.getContextStorage();
// { customer_id: 1 }
```

#### ClsAdapter.getRequestId()

Returns the the request identifier set on the storage. The identifiers key is `request_id`.

```javascript
ClsAdapter.setOnContext('request_id', 'd5caaa0e-b04e-4d94-bc88-3ed3b62dc94a');
ClsAdapter.getRequestId();
// 'd5caaa0e-b04e-4d94-bc88-3ed3b62dc94a'
```

#### ClsAdapter.addContextStorageToInput()

Returns a function that extends the given object with the current storage.

```javascript
ClsAdapter.setOnContext('customer_id', 1);

ClsAdapter.addContextStorageToInput()({ debug: true });
// { debug: true, customer_id: 1 }
```

#### ClsAdapter.addRequestIdToInput()

Returns a function that extends the given object with the request identifier set on the current storage.

```javascript
ClsAdapter.setOnContext('request_id', 'd5caaa0e-b04e-4d94-bc88-3ed3b62dc94a');

ClsAdapter.addRequestIdToInput()({ debug: true });
// { debug: true, request_id: 'd5caaa0e-b04e-4d94-bc88-3ed3b62dc94a' }
```
