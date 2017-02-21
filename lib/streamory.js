var Writable = require('stream').Writable;
var fs = require('fs');

function Streamory(options) {
  Writable.call(this, { objectMode: true });
  this.options = Object.assign({}, options);
  var that = this;
  this._promise = new Promise(function (resolve, reject) {
    that._resolve = resolve;
  });
}

Streamory.prototype = Object.create(Writable.prototype, {
  get: {
    value: function (returnImmediately) {
      if (returnImmediately) return '_cache' in this ? this._cache : null;
      var timeout = this.options.timeout;
      var that = this;
      return new Promise(function (resolve, reject) {
        var timer;
        if (timeout) timer = setTimeout(function () {
          reject({ message: 'Streamory timeout' });
        }, timeout);
        var cleanup = function () { if (timer) clearTimeout(timer); };
        that._promise.then(
          data => (cleanup(), resolve(data)),
          data => (cleanup(), reject(data))
        );
      });
    }
  },
  _write: {
    value: function (chunk, encoding, callback) {
      this._cache = chunk;
      this._promise = Promise.resolve(this._cache);
      if (this._resolve) {
        this._resolve(chunk);
        delete this._resolve;
      }
      if (this.options.file) {
        fs.writeFile(this.options.file, JSON.stringify(this._cache), function (error) {
          callback();
        });
      }
      callback();
    }
  }
});

module.exports = Streamory;
