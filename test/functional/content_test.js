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

describe('Configuration content:', function() {
  var testResults = `${__dirname}/results/content_test`;
  var testCWD = `${__dirname}/fixtures/content_test`;

  describe('with configured pages', function () {

    afterEach(function(done) {
      fs.remove(path.resolve(testResults), function() {
        return done();
      });
    });

    describe('should create html files', function() {
      it('for each markdown page', function () {
        let a = Cli.__get__('build')({ cwd: testCWD })

        // file  assertions!
        .then(res => {
          return Promise.resolve(fs.statSync(path.resolve(testResults, 'markdownpage.html')));
        })
        .then(res => {
          return Promise.resolve(fs.statSync(path.resolve(testResults, 'markdownpage2.html')));
        })
        .catch(e => { console.log(e.stack) ; throw(e) });

        return assert.isFulfilled(a, "files available");
      });

      it('should create html files for each component list', function () {
        let a = Cli.__get__('build')({ cwd: testCWD })

        // file  assertions!
        .then(res => {
          return Promise.resolve(fs.statSync(path.resolve(testResults, 'manualcomplisting.html')));
        });

        return assert.isFulfilled(a, "files available");
      });

      it('should create html files for each tag page', function () {
        let a = Cli.__get__('build')({ cwd: testCWD })

        // file  assertions!
        .then(res => {
          return Promise.resolve(fs.statSync(path.resolve(testResults, 'atoms.html')));
        })

        .then(res => {
          return Promise.resolve(fs.statSync(path.resolve(testResults, 'atoms', 'forms.html')));
        })
        .catch(e => { console.log(e.stack) ; throw(e) });

        return assert.isFulfilled(a, "files available");
      });
    });

    describe('within their content, they', function() {
      var sgConfig = YAML.safeLoad(fs.readFileSync(path.resolve(testCWD, 'styleguide.yaml')));
      it('should have a nested navigation for the content structure', function () {

        let a = Cli.__get__('build')({ cwd: testCWD })

        // file  assertions!
        .then(res => {
            return fsreadfile(path.resolve(testResults, 'atoms.html'))
            .then((content) => {
              var $ = cheerio.load(content);

              var nav = $('.test-stylegen-main-nav');
              var navEntries = $('.test-stylegen-main-nav > a');
              var childLinks = nav.find('.children');

              if (navEntries.length !== sgConfig.content.length) {
                return Promise.reject(`Expected to have exactly ${sgConfig.content.length} links in first nav layer, but found ${navEntries.length}`);
              }

              var mdPageText = 'MarkdownPage';
              if ($(navEntries[0]).text().trim() !== mdPageText) {
                return Promise.reject(`Expected the link to have the link text "${mdPageText}" instead it has "${navEntries.text()}"`);
              }

              var mdPageText2 = 'MarkdownPage2';
              if ($(navEntries[2]).text().trim() !== mdPageText2) {
                return Promise.reject(`Expected the link to have the link text "${mdPageText2}" instead it has "${navEntries.text()}"`);
              }

              var atomsText = 'Atoms';
              if ($(navEntries[1]).text().trim() !== atomsText) {
                return Promise.reject(`Expected the link to have the link text "${atomsText}" instead it has "${navEntries.text()}"`);
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

        })
        .catch(e => { console.log(e.stack) ; throw(e) });

        return assert.isFulfilled(a, "navigation entries available");
      });

      it('should have a list of components in a manual configured component list', function () {
        let sgConfig = YAML.safeLoad(fs.readFileSync(path.resolve(testCWD, 'styleguide.yaml')));

        let a = Cli.__get__('build')({ cwd: testCWD })

        // file  assertions!
        .then(res => {
            return fsreadfile(path.resolve(testResults, 'manualcomplisting.html'))
            .then((content) => {
              var $ = cheerio.load(content);

              var components = $('.components > [id^="component"]');

              let compListConfig = sgConfig.content.filter(c => c.label === "ManualCompListing")[0].content;

              if (components.length !== compListConfig.length) {
                return Promise.reject(`Expected to have exactly ${compListConfig.length} components listed, but found ${components.length}`);
              }

              if ($(components[0]).attr('id') !== "component-app-c") {
                return Promise.reject(`expected Component 1 to be app.c, but found "${$(components[0]).attr('id')}"`);
              }

              if ($(components[1]).attr('id') !== "component-app-b") {
                return Promise.reject(`expected Component 1 to be app.c, but found "${$(components[1]).attr('id')}"`);
              }

              if ($(components[2]).attr('id') !== "component-app-a") {
                return Promise.reject(`expected Component 1 to be app.c, but found "${$(components[2]).attr('id')}"`);
              }

              return Promise.resolve(true);
            });

        })
        .catch(e => { console.log(e.stack) ; throw(e) });

        return assert.isFulfilled(a, "navigation entries available");
      });

      it('should have a preflight document if it is configured for that page', function () {
        let sgConfig = YAML.safeLoad(fs.readFileSync(path.resolve(testCWD, 'styleguide.yaml')));

        let a = Cli.__get__('build')({ cwd: testCWD })

        // file  assertions!
        .then(res => {
            return fsreadfile(path.resolve(testResults, 'complistingwithpreflight.html'))
            .then((content) => {
              var $ = cheerio.load(content);

              var components = $('.components > [id^="component"]');

              let compListConfig = sgConfig.content.filter(c => c.label === "CompListingWithPreflight")[0].content;

              if ($('.preflight-text').length !== 1) {
                return Promise.reject(`expected preflight text to be rendered exactly once, but found "${$('.preflight-text').length}"`);
              }

              return Promise.resolve(true);
            });

        })
        .catch(e => { console.log(e.stack) ; throw(e) });

        return assert.isFulfilled(a, "navigation entries available");
      });
    });
  });
});
