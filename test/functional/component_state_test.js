"use strict";

var fs = require('fs-extra');
// var denodeify = require('denodeify');
// var fsreadfile = denodeify(fs.readFile);

var path = require('path');
var chai = require('chai');
// var chaiAsPromised = require("chai-as-promised");
// chai.use(chaiAsPromised);
var assert = require('chai').assert;

var cheerio = require("cheerio");

var rewire = require('rewire');
var Cli = rewire('../../dist/Cli');

describe('Configured Components:', function() {
  var testName = "component_state_test";
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

  describe('with states given', function() {
    it('should render the view for each state within the proper context', function () {

      var content = fs.readFileSync(path.resolve(testResults, 'manualcomplisting.html'))
      var $ = cheerio.load(content);

      var componentA = $('#component-test-a');

      assert.equal(componentA.find('.state').length, 3, `expected component a to have a view rendered for three states (and it sub state), but found "${componentA.find('.state').length}"`)
      assert.equal(componentA.find('#test-a-hover-button-preview').length, 1, `expected component a to have a view rendered with context.text equal to "in hover state" but found "${componentA.find('#test-a-hover-button-preview').length}"`)
    });
  });
});
