"use strict";

var fs = require('fs-extra');
var path = require('path');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = require('chai').assert;

var jsdom = require("jsdom");
var jquery = fs.readFileSync(path.resolve(__dirname, "../../node_modules/jquery/dist/jquery.js"), "utf-8");

var rewire = require('rewire');
var Cli = rewire('../../dist/Cli');

describe('Configuration content:', function() {
  var testCWD = "test/integration/fixtures/content_test";
  var testResults = "test/integration/results/content_test";

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
        return new Promise(function(resolve, reject) {
          jsdom.env({
            file: path.resolve(testResults, 'atoms.html'),
            src: [jquery],
            done: function (err, window) {
              if (!!err) {
                console.log("ERR", err);
                reject(err);
              }
              var nav = window.$('.test-stylegen-main-nav');
              var navEntries = window.$('.test-stylegen-main-nav > a');
              var childLinks = nav.find('.children');

              if (navEntries.length !== 1) {
                return reject("Expected to have exactly one link in first nav layer");
              }

              var baseLinkText = 'Atoms';
              if (navEntries.text().trim() !== baseLinkText) {
                return reject(`Expected the link to have the link text "${baseLinkText}" instead it has "${navEntries.text()}"`);
              }

              if (childLinks.length !== 1) {
                return reject("Expected to have exactly one child link in first nav layer");
              }

              var childLinkText = 'Forms';
              if (childLinks.text().trim() !== childLinkText) {
                return reject(`Expected the link to have the link text "${childLinkText}" instead it has "${childLinks.text().trim()}"`);
              }

              return resolve(true);
            }
          });
        });
      });

      return assert.isFulfilled(a, "navigation entries available");
    });
  });
});
