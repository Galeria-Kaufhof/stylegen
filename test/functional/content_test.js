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

describe('Configuration content:', function() {
  var testResults = `${__dirname}/results/content_test`;
  var testCWD = `${__dirname}/fixtures/content_test`;

  describe('with given pages', function () {

    afterEach(function(done) {
      fs.remove(path.resolve(testResults), function() {
        return done();
      });
    });

    it('should create html files for each tag page', function () {
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

    it('should create a nested navigation for the content structure', function () {
      let a = Cli.__get__('build')({ cwd: testCWD })

      // file  assertions!
      .then(res => {
          return fsreadfile(path.resolve(testResults, 'atoms.html'))
          .then((content) => {
            var $ = cheerio.load(content);

            var nav = $('.test-stylegen-main-nav');
            var navEntries = $('.test-stylegen-main-nav > a');
            var childLinks = nav.find('.children');

            if (navEntries.length !== 1) {
              return Promise.reject("Expected to have exactly one link in first nav layer");
            }

            var baseLinkText = 'Atoms';
            if (navEntries.text().trim() !== baseLinkText) {
              return Promise.reject(`Expected the link to have the link text "${baseLinkText}" instead it has "${navEntries.text()}"`);
            }

            if (childLinks.length !== 1) {
              return Promise.reject("Expected to have exactly one child link in first nav layer");
            }

            var childLinkText = 'Forms';
            if (childLinks.text().trim() !== childLinkText) {
              return Promise.reject(`Expected the link to have the link text "${childLinkText}" instead it has "${childLinks.text().trim()}"`);
            }

            return Promise.resolve(true);
          });

      });

      return assert.isFulfilled(a, "navigation entries available");
    });
  });
});
