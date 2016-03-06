"use strict";

var fs = require('fs-extra');
// var denodeify = require('denodeify');
// var fsreadfile = denodeify(fs.readFile);

var path = require('path');
var chai = require('chai');
// var chaiAsPromised = require("chai-as-promised");
// chai.use(chaiAsPromised);
var assert = require('chai').assert;

var YAML = require('js-yaml');

var cheerio = require("cheerio");

var rewire = require('rewire');
var Cli = rewire('../../dist/Cli');

describe('Configured Components:', function() {
  var testName = "component_config_test";
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
    sgPromise = styleguide = null;
    fs.removeSync(path.resolve(testResults));
  });

  describe('by default it', function() {
    it('should search for a *.md files in the componentPath folder, which is usually "."', function () {
      assert.equal(styleguide.components.find('test.a').docs[0].name, "test_a", `default doc could not be found, instead ${styleguide.components.find('test.a').docs[0].name} was given`);
    });

    it('should search for a view.hbs', function () {
      assert.equal(styleguide.components.find('test.a').view.name, "view.hbs", `default view.hbs could not be found`);
    });

    it('should search for a _partial.hbs', function () {
      assert.equal(styleguide.components.find('test.a').partials[0].name, "a", `default partial not found`);
    });

    it('should render document links in correct order', function () {
      var content = fs.readFileSync(path.resolve(testResults, 'manualcomplisting.html'))
      var $ = cheerio.load(content);

      var componentADocTabs = $('#component-test-a .component-docs .content-group-nav-link');

      assert.equal(componentADocTabs.length, 2, 'expected to have 2 document links');
      assert.equal($(componentADocTabs[0]).text(), "test_a");
      assert.equal($(componentADocTabs[1]).text(), "test_b");
    });
  });
});
