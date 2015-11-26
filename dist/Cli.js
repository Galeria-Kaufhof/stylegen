"use strict";
var path = require('path');
var Styleguide_1 = require('./Styleguide');
var Logger_1 = require('./Logger');
function resolveStyleguide(options) {
    return new Styleguide_1.Styleguide()
        .initialize(process.cwd(), path.resolve(__dirname, '..'))
        .then(function (styleguide) {
        if (!!options && !!options.prepare) {
            Logger_1.success('Styleguide.prepare:', 'preparing the styleguide target ...');
            return styleguide.prepare();
        }
        else {
            return Promise.resolve(styleguide);
        }
    })
        .then(function (styleguide) {
        Logger_1.success('Styleguide.read:', 'start reading ...');
        return styleguide.read();
    })
        .then(function (styleguide) {
        Logger_1.success('Styleguide.read:', 'finished reading');
        return Promise.resolve(styleguide);
    });
}
/**
 * create the static styleguide
 */
function build() {
    return resolveStyleguide()
        .then(function (styleguide) {
        Logger_1.success('Styleguide.write:', 'start writing ...');
        return styleguide.write();
    })
        .then(function (styleguide) {
        Logger_1.success('Styleguide.write:', 'finished writing');
        return styleguide;
    })
        .catch(function (e) {
        Logger_1.error("Cli.build", "failed to build Styleguide", e);
        console.log(e.callee, e.stack);
        throw (e);
    });
}
;
/**
 * create styleguide partials, and maybe other exports
 */
function createExport() {
    return resolveStyleguide({ prepare: false })
        .catch(function (e) {
        Logger_1.error("Cli.createExport", "failed to build Styleguide", e);
        console.log(e.callee, e.stack);
        throw (e);
    });
    /** create static styleguide structure */
}
;
/**
 * resolve commandline arguments and run the appropriate command
 *
 * TODO: manage commandline arguments :)
 * TODO: add argument to clean the dist folder in beforehand
 */
function command(command, args) {
    switch (command) {
        case "create":
            return build();
        case "export":
            return createExport();
        default:
            return Promise.reject(new Error("Not the command you are searching for"));
    }
}
exports.command = command;
;
