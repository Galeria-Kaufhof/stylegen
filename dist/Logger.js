"use strict";
require('unicorn').install();
function log(...args) {
    if (!process.env.MUTE_CLI_LOG) {
        console.log.apply(console, args);
    }
}
exports.log = log;
function error(...args) {
    if (args.length > 1) {
        args[0] = args[0].red();
    }
    if (!process.env.MUTE_CLI_LOG) {
        console.error.apply(console, args);
    }
}
exports.error = error;
function warn(...args) {
    if (args.length > 1) {
        args[0] = args[0].yellow();
    }
    log.apply(console, args);
}
exports.warn = warn;
function success(...args) {
    if (args.length > 1) {
        args[0] = args[0].green();
    }
    log.apply(console, args);
}
exports.success = success;
