var assert = require('assert');
var mocha = require('mocha');
var stream = require('stream');
var Streamory = require('..');

describe('Streamory', function () {
  it('should cache the last chunk', function (done) {
    var someChunk = 'Hello World';
    var anotherChunk = 'Foo bar baz';
    var source = new stream.Readable({ objectMode: true });
    var streamory = new Streamory();
    source.pipe(streamory);
    source.push(Promise.reject(someChunk));
    for (let i = 0; i < 100; i++) source.push('42');
    source.push(anotherChunk);
    source.push(null);
    streamory.get().catch(function (chunk) {
      assert.equal(chunk, someChunk);
      setTimeout(function () {
        streamory.get().then(function (chunk) {
          assert.equal(chunk, anotherChunk);
          done();
        });
      }, 0);
    });
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

  it('should work with plain object', function (done) {
    var someObject = { foo: 'bar' };
    var source = new stream.PassThrough({ objectMode: true });
    var streamory = new Streamory();
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
    var streamory = new Streamory();
    source.pipe(streamory);
    source.write(someValue);
    streamory.get().then(function (data) {
      assert.equal(data, someValue);
      done();
    });
  });
});
