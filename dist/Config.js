'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _q = require('q');

var Q = _interopRequireWildcard(_q);

var Config = (function () {
    function Config() {
        _classCallCheck(this, Config);
    }

    _createClass(Config, [{
        key: 'resolve',
        value: function resolve(path_or_object) {
            var result;
            var d = Q.defer();
            if (typeof path_or_object == 'object') {
                result = path_or_object;
                d.resolve(result);
            } else if (typeof path_or_object == "string") {
                try {
                    result = JSON.parse(path_or_object.toString());
                    d.resolve(result);
                } catch (e) {
                    try {
                        Q.nfcall(fs.readFile, path_or_object).then(function (buffer) {
                            try {
                                var result = JSON.parse(buffer.toString());
                                d.resolve(result);
                            } catch (e) {
                                d.reject(e);
                            }
                        })['catch'](function (e) {
                            d.reject(e);
                        });
                    } catch (e) {
                        console.warn(e);
                        d.resolve({});
                    }
                }
            } else {
                d.reject("ProjectConfig.load: options type not supported, use either object or string (path to a json file or stringified json)");
            }
            return d.promise;
        }
    }, {
        key: 'load',
        value: function load(options, defaults) {
            var _options = this.resolve(options);
            var _defaults;
            var d = Q.defer();
            if (defaults != null) {
                _defaults = this.resolve(defaults);
            }
            if (options != null) {
                _options = this.resolve(options);
            }
            Q.all([_defaults, _options]).then(function (optionsList) {
                var result = Object.assign.apply(this, optionsList);
                d.resolve(result);
            })['catch'](function (e) {
                console.log(e);
                throw e;
            });
            return d.promise;
        }
    }]);

    return Config;
})();

var ProjectConfig = (function (_Config) {
    _inherits(ProjectConfig, _Config);

    function ProjectConfig() {
        _classCallCheck(this, ProjectConfig);

        _get(Object.getPrototypeOf(ProjectConfig.prototype), 'constructor', this).apply(this, arguments);
    }

    return ProjectConfig;
})(Config);

exports.ProjectConfig = ProjectConfig;