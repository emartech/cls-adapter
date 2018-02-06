'use strict';

const express = require('express');
const contextFactory = require('../src/context-factory/context-factory');
const port = 3000;

const app = express();

app.use(contextFactory.getExpressMiddleware());

app.get('/', (req, res) => {
  contextFactory.setOnContext('customer_id', Math.round(Math.random() * 1000));

  console.log(contextFactory.getContextStorage());

  res.send('It works')
});

app.listen(port);
console.log('listening on port: ' + port);
