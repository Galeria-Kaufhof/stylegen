"use strict";

var fs = require('fs-extra');
var denodeify = require('denodeify');
var fsreadfile = denodeify(fs.readFile);

var path = require('path');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = require('chai').assert;

var cheerio = require("cheerio");

var rewire = require('rewire');
var Cli = rewire('../../dist/Cli');

describe('Configured Components with a view:', function() {
  var testResults = `${__dirname}/results/view_config_test`;
  var testCWD = `${__dirname}/fixtures/view_config_test`;

  afterEach(function(done) {
    fs.remove(path.resolve(testResults), function() {
      return done();
    });
  });

  describe('and a given viewContext', function() {
    it('should provide this as context to the view', function () {
      let a = Cli.__get__('build')({ cwd: testCWD })
      .then(styleguide => {
        return fsreadfile(path.resolve(testResults, 'manualcomplisting.html'))
        .then((content) => {
          var $ = cheerio.load(content);

          var componentA = $('#component-test-a');
          var componentB = $('#component-test-b');

          if (componentA.find('.title').length <= 0 || componentA.find('.title').text() !== 'TEST') {
            return Promise.reject(`expected component a to have title set to TEST but found "${componentA.find('.title').text()}"`);
          }

          if (componentB.find('.title').length <= 0 || componentB.find('.title').text() !== 'TEST') {
            return Promise.reject(`expected component a to have title set to TEST, from front-matter, but found "${componentB.find('.title').text()}"`);
          }

          if (componentB.find('.sub-title').length <= 0 || componentB.find('.sub-title').text() !== 'SUBTEST') {
            return Promise.reject(`expected component a to have a text set by a nested config out of front-matter "${componentB.find('.sub-title').text()}"`);
          }

          return Promise.resolve(true);
        })

      })
      .catch(e => { console.log(e.stack) ; throw(e) });

      return assert.isFulfilled(a, "component configured successfully");
    });
  });
});
