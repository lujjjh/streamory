var assert = require('assert');
var mocha = require('mocha');
var stream = require('stream');
var Streamory = require('..');

describe('Streamory', function () {
  describe('normal mode', function () {
    it('should write what it reads', function (done) {
      var someChunk = 'Hello world!';
      var source = new stream.Readable();
      var writable = new stream.Writable({
        write: function (chunk, encoding, callback) {
          callback();
          assert.equal(chunk, someChunk);
          done();
        }
      });
      source.pipe(new Streamory()).pipe(writable);
      source.push(someChunk);
      source.push(null);
    });

    it('should cache the last chunk', function (done) {
      var someChunk = 'Hello world!';
      var anotherChunk = 'Foo bar baz';
      var tasks = [];
      var source = new stream.Readable();
      var streamory = new Streamory();
      source.pipe(streamory);
      tasks.push(streamory.get());
      source.push(someChunk);
      source.push(anotherChunk);
      source.push(null);
      setTimeout(function () {
        tasks.push(streamory.get());
        Promise.all(tasks).then(function (results) {
          assert.equal(results[0], someChunk);
          assert.equal(results[1], anotherChunk);
          done();
        });
      }, 0);
    });

    it('should return immediately if returnImmediately is truthy', function (done) {
      var someChunk = 'Hello world!';
      var streamory = new Streamory();
      assert.strictEqual(streamory.get(true), null);
      var source = new stream.Readable();
      source.push(someChunk);
      source.push(null);
      source.pipe(streamory);
      setTimeout(function () {
        assert.equal(streamory.get(true), someChunk);
        done();
      });
    });
  });
});
