'use strict';

const continuationLocalStorage = require('cls-hooked');
const uuid = require('uuid');

class ContextFactory {
  static getKoaMiddleware() {
    const namespace = this.createNamespace();

    return async function(ctx, next) {
      await new Promise(namespace.bind(function(resolve, reject) {
        namespace.set(
          'request_id',
          ctx.request.headers['x-request-id'] || uuid.v4()
        );

        next().then(resolve).catch(reject);
      }));
    };
  }

  static getExpressMiddleware() {
    const namespace = this.createNamespace();

    return (req, res, next) => {
      namespace.bindEmitter(req);
      namespace.bindEmitter(res);

      namespace.run(() => {
        namespace.set(
          'request_id',
          req.headers['x-request-id'] || uuid.v4()
        );

        next();
      });
    };
  }

  static setOnContext(key, value) {
    const namespace = this.createNamespace();
    namespace.set(key, value);
  }

  static getContextStorage() {
    if (this._namespace && this._namespace.active) {
      const { id, _ns_name, ...contextData } = this._namespace.active;
      return contextData;
    }

    return {};
  }

  static getRequestId() {
    return this.getContextStorage().request_id;
  }

  static addContextStorageToInput() {
    return (input) => Object.assign({}, input, this.getContextStorage());
  }

  static addRequestIdToInput() {
    return (input) => Object.assign({}, input, { request_id: this.getRequestId() });
  }

  static destroyNamespace() {
    if (this._namespace) {
      continuationLocalStorage.destroyNamespace('session');
      this._namespace = null;
    }
  }

  static createNamespace() {
    if (!this._namespace) {
      this._namespace = continuationLocalStorage.createNamespace('session');
    }
    return this._namespace;
  }
}

module.exports = ContextFactory;
