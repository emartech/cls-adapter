'use strict';

const ContextFactory = require('./context-factory');
const continuationLocalStorage = require('cls-hooked');

describe('ContextFactory', function() {
  const requestId = 'uuid';
  const requestObject = {
    request : {
      headers : { 'x-request-id' : requestId }
    }
  };
  let next;
  let createNamespaceStub;
  let destroyNamespaceStub;
  let namespaceStub;

  beforeEach(function() {
    next = this.sandbox.stub();
    next.returns(Promise.resolve(true));

    createNamespaceStub = this.sandbox.stub(continuationLocalStorage, 'createNamespace');
    destroyNamespaceStub = this.sandbox.stub(continuationLocalStorage, 'destroyNamespace');
    namespaceStub = {
      set: this.sandbox.stub(),
      bind: this.sandbox.stub(),
      run: this.sandbox.stub(),
      runAndReturn: this.sandbox.stub(),
      bindEmitter: this.sandbox.stub()
    };
    namespaceStub.bind.returnsArg(0);
    namespaceStub.run.callsArg(0);
    createNamespaceStub.returns(namespaceStub);
  });

  afterEach(function() {
    ContextFactory.destroyNamespace();
  });

  it('should store request id to session information as koa middleware', async function() {
    await ContextFactory.getKoaMiddleware()(requestObject, next);

    expect(next).to.have.been.called;
    expect(createNamespaceStub).to.have.been.calledWith('session');
    expect(namespaceStub.set).to.have.been.calledWith('request_id', requestId);
  });

  it('should store request id to session information as express middleware', function() {
    ContextFactory.getExpressMiddleware()(requestObject.request, {}, next);

    expect(next).to.have.been.called;
    expect(createNamespaceStub).to.have.been.calledWith('session');
    expect(namespaceStub.set).to.have.been.calledWith('request_id', requestId);
  });

  it('should return stored data on context', function() {
    this.sandbox.restore();

    const namespace = ContextFactory.createNamespace();

    namespace.run(function(){
      ContextFactory.setOnContext('request_id', 'uid');

      const storage = ContextFactory.getContextStorage();

      expect(storage).to.eql({ request_id: 'uid' });
    });
  });

  it('should return request id from context', function() {
    this.sandbox.restore();

    const namespace = ContextFactory.createNamespace();

    namespace.run(function(){
      ContextFactory.setOnContext('request_id', 'uid');

      const requestId = ContextFactory.getRequestId();

      expect(requestId).to.eql('uid');
    });
  });

  it('should add context storage to input', function() {
    this.sandbox.restore();

    const namespace = ContextFactory.createNamespace();

    namespace.run(function(){
      ContextFactory.setOnContext('request_id', 'uid');
      ContextFactory.setOnContext('customer_id', 15);

      const add = ContextFactory.addContextStorageToInput();

      expect(add({ debug: true })).to.eql({ debug: true, request_id: 'uid', customer_id: 15 });
    });
  });

it('should convert to objects when adding context storage to input', function() {
    this.sandbox.restore();

    const namespace = ContextFactory.createNamespace();

    namespace.run(function(){
      ContextFactory.setOnContext('application.customer.id', 15);

      const add = ContextFactory.addContextStorageToInput();

      expect(add({ debug: true })).to.eql({
        debug: true, application: { customer: { id: 15 } }
      });
    });
  });

it('should merge logged object when called multiple times', function() {
    this.sandbox.restore();

    const namespace = ContextFactory.createNamespace();

    namespace.run(function(){
      ContextFactory.setOnContext('application.customer.id', 15);
      ContextFactory.setOnContext('application.customer.name', 'lajos');
      ContextFactory.setOnContext('application.monkey', 'banana');

      const add = ContextFactory.addContextStorageToInput();

      expect(add({ debug: true })).to.eql({
        debug: true, application: { customer: { id: 15, name: 'lajos' }, monkey: 'banana' }
      });
    });
  });

  it('should add request id to input', function() {
    this.sandbox.restore();

    const namespace = ContextFactory.createNamespace();

    namespace.run(function(){
      ContextFactory.setOnContext('request_id', 'uid');

      const add = ContextFactory.addRequestIdToInput();

      expect(add({ debug: true })).to.eql({ debug: true, request_id: 'uid' });
    });
  });

  it('should run given callback in context', function() {
    const callback = this.sandbox.stub().returns('works');
    namespaceStub.runAndReturn.callsArg(0);

    const result = ContextFactory.run(callback);

    expect(result).to.eql('works');
    expect(namespaceStub.runAndReturn).to.have.been.calledWith(callback);
  });
});
