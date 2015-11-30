var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = require('chai').assert;

var rewire = require('rewire');
var configMod = rewire('../../dist/Config');


configMod.__set__({
  Logger_1: {
    error: function() {}
  }
});

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
      var result;

      configMod.__with__({
        fsreadfile: function (path) {
          return Promise.resolve(jsonTest);
        }
      })(function () {
        var config = new configMod.Config();
        result = config.resolveFile("fubar.json");
      });

      return assert.becomes(result, JSON.parse(jsonTest));
    });

    it('should reject on parseError', function () {
      var jsonTest = `{ "test": ["a", "b", "c" } `;
      var result;

      configMod.__with__({
        fsreadfile: function (path) {
          return Promise.resolve(jsonTest);
        }
      })(function () {
        var config = new configMod.Config();
        result = config.resolveFile("fubar.json");
      });

      return assert.isRejected(result);
    });

  });



  describe('#resolve()', function () {

    it('should just resolve the object if one is given', function () {
      var jsonTest = { "test": ["a", "b", "c"] };
      var result;

      config = new Config();
      result = config.resolve(jsonTest);

      return assert.becomes(result, jsonTest);
    });

    it('should see if theres an object in the given string', function () {
      var jsonTest = `{ "test": ["a", "b", "c"] }`;
      var result;

      config = new Config();
      result = config.resolve(jsonTest);

      return assert.becomes(result, JSON.parse(jsonTest));
    });

    it('should resolve the given string as path, if it is not a parsable object', function () {
      var jsonTest = `{ "test": ["a", "b", "c"] } `;
      var result;

      configMod.__with__({
        fsreadfile: function (path) {
          return Promise.resolve(jsonTest);
        }
      })(function () {
        var config = new configMod.Config();
        result = config.resolveFile("fubar.json");
      });

      return assert.becomes(result, JSON.parse(jsonTest));
    });

  });


  describe('#load()', function () {

    it('should resolve a single config', function () {
      var jsonTest = { "test": ["a", "b", "c"] };
      var result;

      var config = new configMod.Config();
      result = config.load(jsonTest);

      return assert.becomes(result, jsonTest);
    });

    it('should merge two configs, if given', function () {
      var options = { "test": ["a", "b", "c"] };
      var defaults = { "test2": ["c", "d", "e"] };
      var result;

      var config = new configMod.Config();
      result = config.load(options, defaults);
      return assert.becomes(result, { "test": ["a", "b", "c"], "test2": ["c", "d", "e"] });
    });

    it('options should overwrite defaults', function () {
      var options = { "test": ["a", "b", "c"] };
      var defaults = { "test": ["c", "d", "e"], "additional": "test" };
      var result;

      var config = new configMod.Config();
      result = config.load(options, defaults);
      return assert.becomes(result, { "test": ["a", "b", "c"], "additional": "test"});
    });

  });

});
