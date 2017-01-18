var assert = require('assert');
var mocha = require('mocha');
var stream = require('stream');
var Streamory = require('..');

describe('Streamory', function () {
  describe('object mode', function () {
    it('should work with plain object', function (done) {
      var someObject = { foo: 'bar' };
      var source = new stream.PassThrough({ objectMode: true });
      var streamory = new Streamory({ objectMode: true });
      source.pipe(streamory);
      source.write(someObject);
      streamory.get().then(function (data) {
        assert.equal(data, someObject);
        done();
      });
    });

    it('should work with falsy value', function (done) {
      var someValue = false;
      var source = new stream.PassThrough({ objectMode: true });
      var streamory = new Streamory({ objectMode: true });
      source.pipe(streamory);
      source.write(someValue);
      streamory.get().then(function (data) {
        assert.equal(data, someValue);
        done();
      });
    });
  });
});
