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

describe('Configuration dependencies:', function() {
  var testResults = `${__dirname}/results/dependencies_test`;
  var testCWD = `${__dirname}/fixtures/dependencies_test`;

  afterEach(function(done) {
    // fs.remove(path.resolve(testResults), function() {
    //   return done();
    // });
    return done();
  });

  describe('with configured style deps', function () {
    var sgConfig = YAML.safeLoad(fs.readFileSync(path.resolve(testCWD, 'styleguide.yaml')));

    it('should contain the content inside of the head tag', function () {
      let sgConfig = YAML.safeLoad(fs.readFileSync(path.resolve(testCWD, 'styleguide.yaml')));

      let a = Cli.__get__('build')({ cwd: testCWD })

      // file  assertions!
      .then(res => {
          return fsreadfile(path.resolve(testResults, 'components.html'))
          .then((content) => {
            var $ = cheerio.load(content);

            var cssRef = $('head link[rel=stylesheet][href="assets/test.css"]');

            if (cssRef.length !== 1) {
              return Promise.reject(`Expected to have exactly one reference to the stylesheet, but found ${cssRef.length}`);
            }

            var jsRef = $('body script[src="assets/test.js"]');

            if (jsRef.length !== 1) {
              return Promise.reject(`Expected to have exactly one reference to the js dep script tag, but found ${jsRef.length}`);
            }

            return Promise.resolve(true);
          });

      });

      return assert.isFulfilled(a, "navigation entries available");
    });
  });

  describe('with a defined head template', function () {
    var sgConfig = YAML.safeLoad(fs.readFileSync(path.resolve(testCWD, 'styleguide.yaml')));

    it('should contain the content inside of the head tag', function () {
      let sgConfig = YAML.safeLoad(fs.readFileSync(path.resolve(testCWD, 'styleguide.yaml')));

      let a = Cli.__get__('build')({ cwd: testCWD })

      // file  assertions!
      .then(res => {
          return fsreadfile(path.resolve(testResults, 'components.html'))
          .then((content) => {
            var $ = cheerio.load(content);

            return Promise.resolve(true);
          });

      });

      return assert.isFulfilled(a, "navigation entries available");
    });
  });
});
