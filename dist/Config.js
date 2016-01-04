"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs-extra');
var path = require('path');
var denodeify = require('denodeify');
var YAML = require('js-yaml');
var Logger_1 = require('./Logger');
var fsreadfile = denodeify(fs.readFile);
/**
 * Config resolver for conveniant merging of configuration options and defaults.
 */

var Config = (function () {
    function Config() {
        _classCallCheck(this, Config);
    }

    _createClass(Config, [{
        key: 'parseFileContent',
        value: function parseFileContent(filePath, buffer) {
            var result;
            if (path.extname(filePath) === '.yml' || path.extname(filePath) === '.yaml') {
                result = YAML.safeLoad(buffer.toString());
            } else {
                result = JSON.parse(buffer.toString());
            }
            return result;
        }
    }, {
        key: 'resolveFile',
        value: function resolveFile(filePath) {
            var _this = this;

            return fsreadfile(filePath).then(function (buffer) {
                /** catch and return json parsing errors */
                try {
                    return _this.parseFileContent(filePath, buffer);
                } catch (e) {
                    Logger_1.error("Config.resolveFile:", "ParseError", filePath);
                    Logger_1.error(e.stack);
                    return Promise.reject(e);
                }
            });
        }
        /**
         * this is the flesh and bones of the config resolving.
         * If it is a file, load the file, if it is a string containing
         * a json string parse it, and if it is an object it is already fine.
         */

    }, {
        key: 'resolve',
        value: function resolve(path_or_object) {
            var _this2 = this;

            var result;
            return new Promise(function (resolve, reject) {
                if ((typeof path_or_object === 'undefined' ? 'undefined' : _typeof(path_or_object)) == 'object') {
                    /** argument is a plain object */
                    result = path_or_object;
                    resolve(result);
                } else if (typeof path_or_object == "string") {
                    /** argument is a string, so lets try to figure out what it is */
                    try {
                        /** lets see if the string contains a json object */
                        result = JSON.parse(path_or_object.toString());
                        resolve(result);
                    } catch (e) {
                        /** ok, it may be a file path, so lets resolve the file and return it as json object */
                        resolve(_this2.resolveFile(path_or_object.toString()));
                    }
                } else {
                    reject("IStyleguideConfig.load: options type not supported, use either object or string (path to a json file or stringified json)");
                }
            });
        }
        /**
         * load supports different setups for configuration setup.
         * You may either pass in a file_path to options or defaults,
         * or the may also be an options hash,
         * or even a string containing json content.
         */

    }, {
        key: 'load',
        value: function load() {
            var _this3 = this;

            for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
                options[_key] = arguments[_key];
            }

            var promises = options.map(function (x) {
                return _this3.resolve(x);
            }).reverse();
            /** resolve config files */
            return Promise.all(promises).then(function (configs) {
                configs = configs.filter(function (x) {
                    return !!x;
                });
                if (configs.length < 1) {
                    configs.push({});
                }
                /** return merged configuration */
                var result = Object.assign.apply(this, configs);
                return result;
            });
        }
    }]);

    return Config;
})();

exports.Config = Config;