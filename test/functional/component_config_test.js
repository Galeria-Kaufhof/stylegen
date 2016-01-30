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

  describe('with no view defined', function() {
    it('should search for a view.hbs', function () {
      console.log(sgPromise)
      assert.equal(styleguide.components.find('test.a').docs[0].name, "test.md", `default doc could not be found, instead ${styleguide.components.find('test.a').docs[0].name} was given`)
      //   if (styleguide.components.find('test.a').docs[0].name === "test.md") {
      //     return Promise.resolve(styleguide);
      //   } else {
      //     return Promise.reject();
      //   }
      // })
      // .then(styleguide => {
      //   if (styleguide.components.find('test.a').view.name === "view.hbs") {
      //     return Promise.resolve(styleguide);
      //   } else {
      //     return Promise.reject("default view.hbs could not be found");
      //   }
      // })
      // .then(styleguide => {
      //   if (styleguide.components.find('test.a').partials[0].name === "a") {
      //     return Promise.resolve(styleguide);
      //   } else {
      //     return Promise.reject("default partial not found");
      //   }
      //
      //
    });
  });
});
