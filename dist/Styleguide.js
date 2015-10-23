'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _q = require('q');

var Q = _interopRequireWildcard(_q);

var _Config = require('./Config');

var _StructureBuilder = require('./StructureBuilder');

var Styleguide = (function () {
    function Styleguide() {
        _classCallCheck(this, Styleguide);
    }

    _createClass(Styleguide, [{
        key: 'initialize',
        value: function initialize(cwd, upfrontRoot) {
            var d = Q.defer();
            var self = this;
            new _Config.ProjectConfig().load(path.resolve(cwd, 'styleguide.json'), path.resolve(upfrontRoot, 'defaults.json')).then(function (mergedConfig) {
                self.config = mergedConfig;
                self.config["cwd"] = cwd;
                d.resolve(self);
            })['catch'](function (e) {
                console.log("Styleguide.initialize:", e);
                throw e;
            });
            return d.promise;
        }
    }, {
        key: 'read',
        value: function read() {
            var d = Q.defer();
            new _StructureBuilder.StructureBuilder(this.config).collect().then(function (obj) {
                d.resolve(this);
            })['catch'](function (e) {
                console.log("Styleguide.read:", e);
                throw e;
            });
            return d.promise;
        }
    }, {
        key: 'write',
        value: function write() {}
    }]);

    return Styleguide;
})();

exports.Styleguide = Styleguide;