var PassThrough = require('stream').PassThrough;

function Streamory(...args) {
  PassThrough.call(this, ...args);
  var that = this;
  this._promise = new Promise(function (resolve, reject) {
    that._resolve = resolve;
    that.on('error', reject);
  }).then(function (data) {
    delete that._promise;
    delete that._resolve;
    return data;
  });
}

Streamory.prototype = Object.create(PassThrough.prototype, {
  get: {
    value: function (returnImmediately) {
      if (returnImmediately) return '_cache' in this ? this._cache : null;
      if (this._promise) {
        return this._promise;
      } else {
        return Promise.resolve(this._cache);
      }
    }
  },
  _transform: {
    value: function (chunk, encoding, callback) {
      PassThrough.prototype._transform.call(this, chunk, encoding, callback);
      this._cache = chunk;
      if (this._resolve) this._resolve(chunk);
    }
  }
});

module.exports = Streamory;
