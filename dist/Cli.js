"use strict";
var path = require('path');
var Styleguide_1 = require('./Styleguide');
var Logger_1 = require('./Logger');
function resolveStyleguide(options) {
    let cwd = !!options && !!options.cwd ? options.cwd : process.cwd();
    Logger_1.success('Styleguide.new:', 'initialize styleguide ...');
    return new Styleguide_1.Styleguide()
        .initialize(cwd, path.resolve(__dirname, '..'))
        .then(function (styleguide) {
        Logger_1.success('Styleguide.new:', 'initialize finished');
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
function build(options) {
    var options = Object.assign({}, options);
    return resolveStyleguide(options)
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
function createExport(options) {
    var options = Object.assign({}, options, { prepare: false });
    /** we need no styleguide preparation, like asset copying etc. */
    return resolveStyleguide(options)
        .then(function (styleguide) {
        return styleguide.export();
    })
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
            Logger_1.success("Cli.command", "create");
            return build();
        case "export":
            Logger_1.success("Cli.command", "export");
            return createExport();
        default:
            return Promise.reject(new Error("Not the command you are searching for"));
    }
}
exports.command = command;
;
