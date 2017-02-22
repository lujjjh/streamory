var assert = require('assert');
var mocha = require('mocha');
var stream = require('stream');
var Streamory = require('..');

const file = '/tmp/streamory_' + Date.now();

describe('Streamory with the file option specified', function () {
  it('should cache the data in the file', function (done) {
    var chunk = 'Hello world';
    var streamory = new Streamory({ file });
    streamory.write(chunk);
    new Streamory({ file }).get().then(function (data) {
      assert.strictEqual(chunk, data);
      done();
    }, console.error);
  });

  it('should emit filewriteerror event if error occurs when writing', function (done) {
    var chunk = 'Hello world';
    var streamory = new Streamory({ file: '/' });
    streamory.once('filewriteerror', function () { done(); });
    streamory.write(chunk);
  });

  it('should emit filereaderror event if error occurs when reading', function (done) {
    var streamory = new Streamory({ file: '/' });
    streamory.once('filereaderror', function () { done(); });
    streamory.get();
  });

  it('should not read cache from file if data is written within the timeout', function (done) {
    var chunk = 'Hello world';
    var streamory = new Streamory({ file: '/', timeout: 100 });
    streamory.once('filereaderror', assert.bind(false));
    setTimeout(function () { streamory.write(chunk); }, 1);
    streamory.get().then(function (data) {
      assert.strictEqual(chunk, data);
      done();
    });
  });
});
