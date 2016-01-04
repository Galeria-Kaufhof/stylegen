"use strict";

var fs = require('fs-extra');
var denodeify = require('denodeify');
var fsreadfile = denodeify(fs.readFile);

var path = require('path');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = require('chai').assert;

var YAML = require('js-yaml');

var cheerio = require("cheerio");

var rewire = require('rewire');
var Cli = rewire('../../dist/Cli');

describe('Configured Components:', function() {
  var testResults = `${__dirname}/results/component_config_test`;
  var testCWD = `${__dirname}/fixtures/component_config_test`;

  afterEach(function(done) {
    fs.remove(path.resolve(testResults), function() {
      return done();
    });
  });


  describe('with no view defined', function() {
    it('should search for a view.hbs', function () {
      let a = Cli.__get__('build')({ cwd: testCWD })
      .then(styleguide => {
        if (styleguide.components.find('test.a').docs[0].name === "test.md") {
          return Promise.resolve(styleguide);
        } else {
          return Promise.reject(`default doc could not be found, instead ${styleguide.components.find('test.a').docs[0].name} was given`);
        }
      })
      .then(styleguide => {
        if (styleguide.components.find('test.a').view.name === "view.hbs") {
          return Promise.resolve(styleguide);
        } else {
          return Promise.reject("default view.hbs could not be found");
        }
      })
      .then(styleguide => {
        if (styleguide.components.find('test.a').partials[0].name === "a") {
          return Promise.resolve(styleguide);
        } else {
          return Promise.reject("default partial not found");
        }
      })
      .catch(e => { console.log(e.stack) ; throw(e) });

      return assert.isFulfilled(a, "component configured successfully");
    });
  });
});
