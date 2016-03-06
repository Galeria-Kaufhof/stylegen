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

describe('Component States:', function() {
  var testName = "component_state_test";
  var testResults = `${__dirname}/results/${testName}`;
  var testCWD = `${__dirname}/fixtures/${testName}`;

  var sgPromise = null;
  var styleguide = null;

  before(function() {
    return sgPromise = Cli.__get__('build')({ cwd: testCWD })
    .then(sg => {
      styleguide = sg;
    });
  });

  after(function() {
    sgPromise = null;
    fs.removeSync(path.resolve(testResults));
  });


  describe('inside of a styleguide', function() {
    describe('a component with configured states', function() {
      it('should should look for documents named as their names by default', function () {
        assert.equal(styleguide.components.find('test.with-default-docs').states[0].doc.name, "default");
        assert.equal(styleguide.components.find('test.with-default-docs').states[2].doc.name, "on_hover");
        assert.equal(styleguide.components.find('test.with-default-docs').states[3].doc.name, "onSelect");
      });
    });

    describe('a rendered component with states', function() {
      it('should render the view for each state within the proper context', function () {

        var content = fs.readFileSync(path.resolve(testResults, 'manualcomplisting.html'))
        var $ = cheerio.load(content);

        var componentA = $('#component-test-a');
        var componentB = $('#component-test-with-default-docs');
        var componentBDocTabs = $('#component-test-with-default-docs .component-docs');

        assert.equal(componentA.find('.component-state').length, 3, `expected component a to have a view rendered for three states (and it sub state), but found "${componentA.find('.state').length}"`)
        assert.equal(componentB.find('.component-state').length, 4, `expected component a to have a view rendered for three states (and it sub state), but found "${componentB.find('.state').length}"`)

        assert.equal(componentBDocTabs.length, 0, 'expected to not have any component docs, because all docs are bound to states')


        // TODO: re-enable testing of iframe content
        // assert.equal(componentA.find('#test-a-hover-button-preview').length, 1, `expected component a to have a view rendered with context.text equal to "in hover state" but found "${componentA.find('#test-a-hover-button-preview').length}"`)
      });
    });
  });
});
