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
  var testResults = `${__dirname}/results/assets_test`;
  var testCWD = `${__dirname}/fixtures/assets_test`;

  afterEach(function(done) {
    fs.remove(path.resolve(testResults), function() {
      return done();
    });
  });

  describe('with a styleguide default assets', function () {;
    it('should create a copy for each default asset in the target folder', function () {
      let a = Cli.__get__('setupStyleguide')({ cwd: testCWD })

      .then(res => {
        return Promise.resolve(fs.statSync(path.resolve(testResults, 'stylegen-assets', 'defaults.css')));
      })
      .catch(e => { console.log(e.stack) ; throw(e) });

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
      })
      .catch(e => { console.log(e.stack) ; throw(e) });

      return assert.isFulfilled(a, "files available");
    });

  });
});
