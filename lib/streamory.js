var Writable = require('stream').Writable;
var fs = require('fs');

function Streamory(options) {
  Writable.call(this, { objectMode: true });
  this.options = Object.assign({}, options);
  var that = this;
  this._promise = new Promise(function (resolve, reject) {
    that._resolve = resolve;
    that._reject = reject;
  });
}

Streamory.prototype = Object.create(Writable.prototype, {
  get: {
    value: function (returnImmediately) {
      if (returnImmediately) return '_cache' in this ? this._cache : null;
      if (this._resolve && (this.options.file || this.options.timeout !== void 0)) {
        var timeout = this.options.timeout | 0;
        var that = this;
        var timer = setTimeout(function () {
          if (!that._resolve) return;
          if (!that.options.file) return that._reject({ message: 'Streamory timeout' });
          fs.readFile(that.options.file, function (error, data) {
            if (!that._resolve) return;
            if (error) {
              if (error) that.emit('filereaderror', error);
              if (that.options.timeout !== void 0) that._reject({ message: 'Streamory timeout' });
              return;
            }
            try {
              that.write(JSON.parse(data));
            } catch (error) {
              that._reject({ message: 'failed to parse the cache' });
            }
          });
        }, timeout);
      }
      return this._promise;
    }
  },
  _write: {
    value: function (chunk, encoding, callback) {
      var that = this;
      this._cache = chunk;
      this._promise = Promise.resolve(this._cache);
      if (this._resolve) {
        this._resolve(chunk);
        delete this._resolve;
        delete this._reject;
      }
      if (this.options.file) {
        fs.writeFile(this.options.file, JSON.stringify(this._cache), function (error) {
          if (error) that.emit('filewriteerror', error);
          callback();
        });
      } else {
        callback();
      }
    }
  }
});

module.exports = Streamory;
