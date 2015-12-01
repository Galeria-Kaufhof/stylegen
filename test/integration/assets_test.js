"use strict";

var fs = require('fs-extra');
var path = require('path');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = require('chai').assert;


var rewire = require('rewire');
var Cli = rewire('../../dist/Cli');

describe('Configuration assets:', function() {
  var testResults = "test/integration/results/assets_test";
  var testCWD = "test/integration/fixtures/assets_test";

  afterEach(function() {
    return fs.remove(path.resolve(testResults));
  });

  describe('with a styleguide default assets', function () {;
    it('should create a copy for each default asset in the target folder', function () {
      let testCWD = "test/integration/fixtures/assets_test";
      let a = Cli.__get__('setupStyleguide')({ cwd: testCWD })

      .then(res => {
        return Promise.resolve(fs.statSync(path.resolve(testResults, 'stylegen-assets', 'defaults.css')));
      });

      return assert.isFulfilled(a, "files available");
    });

  });

  describe('with a styleguide configuration with configured assets', function () {
    it('should create a copy for each asset in the target folder', function () {
      let a = Cli.__get__('setupStyleguide')({ cwd: testCWD })

      .then(res => {
        return Promise.resolve(fs.statSync(path.resolve(testResults, 'assets', 'test.css')));
      })
      .then(res => {
        return Promise.resolve(fs.statSync(path.resolve(testResults, 'assets2', 'test.js')));
      });

      return assert.isFulfilled(a, "files available");
    });

  });
});
