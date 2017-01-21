var PassThrough = require('stream').PassThrough;

function Streamory(options) {
  PassThrough.call(this, Object.assign({ objectMode: true }, options));
  var that = this;
  this._promise = new Promise(function (resolve, reject) {
    that._resolve = resolve;
  });
}

Streamory.prototype = Object.create(PassThrough.prototype, {
  get: {
    value: function (returnImmediately) {
      if (returnImmediately) return '_cache' in this ? this._cache : null;
      return this._promise;
    }
  },
  _transform: {
    value: function (chunk, encoding, callback) {
      PassThrough.prototype._transform.call(this, chunk, encoding, callback);
      this._cache = chunk;
      this._promise = Promise.resolve(this._cache);
      if (this._resolve) {
        this._resolve(chunk);
        delete this._resolve;
      }
    }
  }
});

module.exports = Streamory;
