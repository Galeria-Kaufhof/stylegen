"use strict";
var fs = require('fs');
var path = require('path');
var denodeify = require('denodeify');
var YAML = require('js-yaml');
var Logger_1 = require('./Logger');
var fsreadfile = denodeify(fs.readFile);
/**
 * Config resolver for conveniant merging of configuration options and defaults.
 */
class Config {
    parseFileContent(filePath, buffer) {
        var result;
        if (path.extname(filePath) === '.yml' || path.extname(filePath) === '.yaml') {
            result = YAML.safeLoad(buffer.toString());
        }
        else {
            result = JSON.parse(buffer.toString());
        }
        return result;
    }
    resolveFile(filePath) {
        return fsreadfile(filePath)
            .then((buffer) => {
            /** catch and return json parsing errors */
            try {
                return this.parseFileContent(filePath, buffer);
            }
            catch (e) {
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
    resolve(path_or_object) {
        var result;
        return new Promise((resolve, reject) => {
            if (typeof (path_or_object) == 'object') {
                /** argument is a plain object */
                result = path_or_object;
                resolve(result);
            }
            else if (typeof (path_or_object) == "string") {
                /** argument is a string, so lets try to figure out what it is */
                try {
                    /** lets see if the string contains a json object */
                    result = JSON.parse(path_or_object.toString());
                    resolve(result);
                }
                catch (e) {
                    /** ok, it may be a file path, so lets resolve the file and return it as json object */
                    resolve(this.resolveFile(path_or_object.toString()));
                }
            }
            else {
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
    load(options, defaults) {
        var _options = this.resolve(options);
        var _defaults;
        if (defaults != null) {
            _defaults = this.resolve(defaults);
        }
        /** cleanup defaults promise if not there ;) */
        var promises = [_defaults, _options].filter((x) => !!x);
        /** resolve config files */
        return Promise.all(promises)
            .then(function (configs) {
            /** return merged configuration */
            var result = Object.assign.apply(this, configs);
            return result;
        });
    }
}
exports.Config = Config;
