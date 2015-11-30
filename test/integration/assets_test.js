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
  let testResults = "test/integration/results/assets_test";

  describe('with a styleguide configuration with configured assets', function () {
    afterEach(function() {
      // return fs.remove(path.resolve(testResults));
    });


    it('should create html files for each tag page', function () {
      let testCWD = "test/integration/fixtures/assets_test";
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
