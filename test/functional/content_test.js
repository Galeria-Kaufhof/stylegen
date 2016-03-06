"use strict";

var fs = require('fs-extra');

var path = require('path');
var chai = require('chai');

var assert = require('chai').assert;

var YAML = require('js-yaml');

var cheerio = require("cheerio");

var rewire = require('rewire');
var Cli = rewire('../../dist/Cli');

describe('Configuration content:', function() {
  var testName = "content_test";
  var testResults = `${__dirname}/results/${testName}`;
  var testCWD = `${__dirname}/fixtures/${testName}`;
  var sgPromise = null;

  before(function() {
    return sgPromise = Cli.__get__('build')({ cwd: testCWD });
  });

  after(function() {
    sgPromise = null;
    // fs.removeSync(path.resolve(testResults));
  });

  describe('with configured pages', function () {

    describe('should create html files', function() {
      it('for each markdown page', function () {
        assert.ok(fs.statSync(path.resolve(testResults, 'markdownpage.html')));
        assert.ok(fs.statSync(path.resolve(testResults, 'markdownpage2.html')));
      });

      it('should create html files for each component list', function () {
        assert.ok(fs.statSync(path.resolve(testResults, 'manualcomplisting.html')));
      });

      it('should create html files for the atom entry', function () {
        assert.ok(fs.statSync(path.resolve(testResults, 'atoms.html')));
      });

      it('should create html files for the form content entry', function () {
        // assert.ok(fs.statSync(path.resolve(testResults, 'atoms', 'forms.html')));
      });
    });
  //
    describe('within their content, they', function() {
      var sgConfig = YAML.safeLoad(fs.readFileSync(path.resolve(testCWD, 'styleguide.yaml')));

      it('should have a nested navigation for the content structure', function () {

          var content = fs.readFileSync(path.resolve(testResults, 'atoms.html'));

          var $ = cheerio.load(content);

          var nav = $('.test-stylegen-main-nav');
          var navEntries = $('.test-stylegen-main-nav > ul > li > a');
          var childLinks = nav.find('.test-stylegen-children');

          var mdPageText = 'MarkdownPage';
          var mdPageText2 = 'MarkdownPage2'
          var atomsText = 'Atoms';
          var childLinkText = 'Forms';

          assert.equal(navEntries.length, sgConfig.content.length, `Expected to have exactly ${sgConfig.content.length} links in first nav layer, but found ${navEntries.length}`);
          assert.strictEqual($(navEntries[0]).text().trim(), mdPageText, `Expected the link to have the link text "${mdPageText}" instead it has "${navEntries.text()}"`);
          assert.strictEqual($(navEntries[2]).text().trim(), mdPageText2, `Expected the link to have the link text "${mdPageText2}" instead it has "${navEntries.text()}"`);
          assert.strictEqual($(navEntries[1]).text().trim(), atomsText, `Expected the link to have the link text "${atomsText}" instead it has "${navEntries.text()}"`);
          assert.equal(childLinks.length, 1, "Expected to have exactly one child link in first nav layer");
          assert.strictEqual(childLinks.text().trim(), childLinkText, `Expected the link to have the link text "${childLinkText}" instead it has "${childLinks.text().trim()}"`);
      });

      it('should have a list of components in a manual configured component list', function () {
        let sgConfig = YAML.safeLoad(fs.readFileSync(path.resolve(testCWD, 'styleguide.yaml')));

        var content = fs.readFileSync(path.resolve(testResults, 'manualcomplisting.html'));

        var $ = cheerio.load(content);

        var components = $('.components-page [id^="component"]');

        let compListConfig = sgConfig.content.filter(c => c.label === "ManualCompListing")[0].content;

        assert.equal(components.length, compListConfig.length, `Expected to have exactly ${compListConfig.length} components listed, but found ${components.length}`);
        assert.strictEqual($(components[0]).attr('id'), "component-app-c", `expected Component 1 to be app.c, but found "${$(components[0]).attr('id')}"`);
        assert.strictEqual($(components[1]).attr('id'), "component-app-b", `expected Component 1 to be app.c, but found "${$(components[1]).attr('id')}"`);
        assert.strictEqual($(components[2]).attr('id'), "component-app-a", `expected Component 1 to be app.c, but found "${$(components[2]).attr('id')}"`);
      });

      it('should have a preflight document if it is configured for that page', function () {
        let sgConfig = YAML.safeLoad(fs.readFileSync(path.resolve(testCWD, 'styleguide.yaml')));

          var content = fs.readFileSync(path.resolve(testResults, 'complistingwithpreflight.html'));

          var $ = cheerio.load(content);

          var components = $('.components-page [id^="component"]');

          let compListConfig = sgConfig.content.filter(c => c.label === "CompListingWithPreflight")[0].content;

          assert.equal($('.test-stylegen-preflight').length, 1, `expected preflight text to be rendered exactly once, but found "${$('.preflight-text').length}"`);
      });
    });
  });
});
