"use strict";

var fs = require('fs-extra');
var path = require('path');
var chai = require('chai');
// var chaiAsPromised = require("chai-as-promised");
// chai.use(chaiAsPromised);
var assert = require('chai').assert;


var rewire = require('rewire');
var Cli = rewire('../../dist/Cli');

describe('Configuration assets:', function() {
  var testResults = `${__dirname}/results/assets_test`;
  var testCWD = `${__dirname}/fixtures/assets_test`;

  var sgPromise = null;

  before(function() {
    return sgPromise = Cli.__get__('build')({ cwd: testCWD });
  });

  after(function() {
    sgPromise = null;
    fs.removeSync(path.resolve(testResults));
  });

  describe('with a styleguide default assets', function () {;
    it('should create a copy for each default asset in the target folder', function () {
      assert.ok(fs.statSync(path.resolve(testResults, 'stylegen-assets', 'styles/stylegen-theme-flatwhite.css')));
    });
  });

  describe('with a styleguide configuration with configured assets', function () {
    it('should create a copy for each asset in the target folder', function () {
      assert.ok(fs.statSync(path.resolve(testResults, 'assets', 'test.css')));
    });

  });
});
