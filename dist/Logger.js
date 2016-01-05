"use strict";

require('unicorn').install();
function log() {
    if (!process.env.MUTE_CLI_LOG) {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        console.log.apply(console, args);
    }
}
exports.log = log;
function error() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
    }

    if (args.length > 1) {
        args[0] = args[0].red();
    }
    if (!process.env.MUTE_CLI_LOG) {
        console.error.apply(console, args);
    }
}
exports.error = error;
function warn() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
    }

    if (args.length > 1) {
        args[0] = args[0].yellow();
    }
    log.apply(console, args);
}
exports.warn = warn;
function success() {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
    }

    if (args.length > 1) {
        args[0] = args[0].green();
    }
    log.apply(console, args);
}
exports.success = success;