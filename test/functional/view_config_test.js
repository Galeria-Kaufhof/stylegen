"use strict";

var fs = require('fs-extra');

var path = require('path');
var chai = require('chai');

var assert = require('chai').assert;

var cheerio = require("cheerio");

var rewire = require('rewire');
var Cli = rewire('../../dist/Cli');

describe('Configured Components with a view:', function() {
  var testName = "view_config_test";
  var testResults = `${__dirname}/results/${testName}`;
  var testCWD = `${__dirname}/fixtures/${testName}`;

  var sgPromise = null;

  before(function() {
    return sgPromise = Cli.__get__('build')({ cwd: testCWD });
  });

  after(function() {
    sgPromise = null;
    fs.removeSync(path.resolve(testResults));
  });

  describe('and a given viewContext', function() {
    it('should provide this as context to the view', function () {
      var content = fs.readFileSync(path.resolve(testResults, 'manualcomplisting.html'))
      var $ = cheerio.load(content);

      var componentA = $('#component-test-a');
      var componentB = $('#component-test-b');

      // assert.strictEqual(componentA.find('.title').text(), 'TEST', `expected component a to have title set to TEST but found "${componentA.find('.title').text()}"`);
      // assert.strictEqual(componentB.find('.title').text(), 'TEST', `expected component a to have title set to TEST, from front-matter, but found "${componentB.find('.title').text()}"`);
      // assert.strictEqual(componentB.find('.sub-title').text(), 'SUBTEST', `expected component a to have a text set by a nested config out of front-matter "${componentB.find('.sub-title').text()}"`);
    });
  });
});
