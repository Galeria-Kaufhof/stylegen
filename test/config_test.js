var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = require('chai').assert;

var rewire = require('rewire');
// var Config = require('../dist/Config').Config;
var configMod = rewire('../dist/Config');

// configMod.__set__(
//   { fs:
//     { readFile: function (path, callback) {
//         callback(null, true);
//       }
//     }
//   }
// );

var Config = configMod.Config;

describe('Config', function() {
  var config;

  describe('#parseFileContent()', function () {

    beforeEach(function() {
      config = new Config();
    });


    it('should parse yaml content, if a yaml filepath is given', function () {
      var yamlTest = `
        test:
          - a
          - b
          - c
      `;

      var result = config.parseFileContent("fubar.yaml", yamlTest)

      assert.deepEqual(result.test, ["a", "b", "c"], "Parsed yaml content should include the complete array");
    });

    it('should fail if errorneous yaml content is delivered', function () {
      // missing bracket at the end
      var yamlTest = `{ "test": ["a", "b", "c" }`;

      assert.throws(function() { config.parseFileContent("fubar.yaml", yamlTest) }, "YAMLException", "Boom! as expected :)");
      // config.parseFileContent;
    });

    it('should parse json content, if a json filepath is given', function () {
      var jsonTest = `{ "test": ["a", "b", "c"]}`;

      var result = config.parseFileContent("fubar.json", jsonTest);

      assert.deepEqual(result.test, ["a", "b", "c"], "Parsed json content should include the complete array");
    });

    it('should fail if errorneous json content is delivered', function () {
      // missing bracket at the end
      var jsonTest = `{ "test": ["a", "b", "c" }`;

      assert.throws(function() { config.parseFileContent("fubar.json", jsonTest) }, "Unexpected", "Boom! as expected :)");
    });

  });




  describe('#resolveFile()', function () {

    it('should read the file content and return it parsed', function () {
      var jsonTest = `{ "test": ["a", "b", "c"] } `;
      var promise;

      configMod.__with__({
        fsreadfile: function (path) {
          return Promise.resolve(jsonTest);
        }
      })(function () {
        var config = new configMod.Config();
        promise = config.resolveFile("fubar.json");
      });

      return assert.eventually.deepEqual(promise, JSON.parse(jsonTest));
    });

  });
});
