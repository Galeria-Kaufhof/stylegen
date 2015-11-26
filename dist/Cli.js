"use strict";
var path = require('path');
var Styleguide_1 = require('./Styleguide');
var Logger_1 = require('./Logger');
/**
 * create the static styleguide
 *
 * TODO: add commandline feedback for success and error case
 */
function build() {
    new Styleguide_1.Styleguide()
        .initialize(process.cwd(), path.resolve(__dirname, '..'))
        .then(function (styleguide) {
        Logger_1.success('Styleguide.prepare:', 'preparing the styleguide target ...');
        return styleguide.prepare();
    })
        .then(function (styleguide) {
        Logger_1.success('Styleguide.read:', 'start reading ...');
        return styleguide.read();
    })
        .then(function (styleguide) {
        Logger_1.success('Styleguide.read:', 'finished reading');
        Logger_1.success('Styleguide.write:', 'start writing ...');
        return styleguide.write();
    })
        .then(function (styleguide) {
        Logger_1.success('Styleguide.write:', 'finished writing');
    })
        .catch(function (e) {
        Logger_1.error("Cli.build", "failed to build Styleguide", e);
        console.log(e.callee, e.stack);
        throw (e);
    });
}
exports.build = build;
;
/**
 * resolve commandline arguments and run the appropriate command
 *
 * TODO: manage commandline arguments :)
 * TODO: add argument to clean the dist folder in beforehand
 */
function command(args) {
    build();
}
exports.command = command;
;
