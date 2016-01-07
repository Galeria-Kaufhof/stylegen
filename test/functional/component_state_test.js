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

describe('Configured Components:', function() {
  var testResults = `${__dirname}/results/component_state_test`;
  var testCWD = `${__dirname}/fixtures/component_state_test`;

  afterEach(function(done) {
    fs.remove(path.resolve(testResults), function() {
      return done();
    });
  });

  describe('with states given', function() {
    it('should render the view for each state within the proper context', function () {
      let a = Cli.__get__('build')({ cwd: testCWD })
      .then(styleguide => {
        return fsreadfile(path.resolve(testResults, 'manualcomplisting.html'))
        .then((content) => {
          var $ = cheerio.load(content);

          var componentA = $('#component-test-a');

          if (componentA.find('.base').length !== 4) {
            return Promise.reject(`expected component a to have a view rendered for three states (and it sub state), but found "${componentA.find('.base').length}"`);
          }

          if (componentA.find('.base.hover').length !== 2 || $(componentA.find('.base.hover')[0]).text() !== "in hover state") {
            return Promise.reject(`expected component a to have a view rendered with context.text equal to "in hover state" but found "${$(componentA.find('.base.hover')[0]).text()}"`);
          }

          return Promise.resolve(true);
        })

      })
      .catch(e => { console.log(e.stack) ; throw(e) });

      return assert.isFulfilled(a, "component states configured successfully");
    });
  });
});
