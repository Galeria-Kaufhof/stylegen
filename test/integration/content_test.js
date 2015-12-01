"use strict";

var fs = require('fs-extra');
var path = require('path');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = require('chai').assert;


var rewire = require('rewire');
var Cli = rewire('../../dist/Cli');

describe('Configuration content:', function() {
  let testResults = "test/integration/results/content_test";

  describe('with a styleguide configuration with given pages', function () {
    afterEach(function() {
      return fs.remove(path.resolve(testResults));
    });


    it('should create html files for each tag page', function () {
      let testCWD = "test/integration/fixtures/content_test";
      let a = Cli.__get__('build')({ cwd: testCWD })

      // file  assertions!
      .then(res => {
        return Promise.resolve(fs.statSync(path.resolve(testResults, 'atoms.html')));
      })

      .then(res => {
        return Promise.resolve(fs.statSync(path.resolve(testResults, 'atoms', 'forms.html')));
      });

      return assert.isFulfilled(a, "files available");
    });

  });
});
