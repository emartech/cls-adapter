'use strict';

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
global.expect = require('chai').expect;

chai.use(sinonChai);
global.expect = chai.expect;

beforeEach(function () {
  this.sandbox = sinon.sandbox.create();
  this.clock = sinon.useFakeTimers();
});

afterEach(function () {
  this.sandbox.restore();
  this.sandbox = undefined;
  this.clock.restore();
  this.clock = undefined;
});
