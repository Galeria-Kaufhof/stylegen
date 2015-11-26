"use strict";
require('unicorn').install();
function warn(...args) {
    if (args.length > 1) {
        args[0] = args[0].yellow();
    }
    console.log.apply(console, args);
}
exports.warn = warn;
function error(...args) {
    if (args.length > 1) {
        args[0] = args[0].red();
    }
    console.error.apply(console, args);
}
exports.error = error;
function success(...args) {
    if (args.length > 1) {
        args[0] = args[0].green();
    }
    console.log.apply(console, args);
}
exports.success = success;
