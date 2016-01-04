"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var path = require('path');
var fs = require('fs-extra');
var denodeify = require('denodeify');
var CompilableContent_1 = require('./CompilableContent');
var fsreadfile = denodeify(fs.readFile);

var Partial = (function (_CompilableContent_1$) {
    _inherits(Partial, _CompilableContent_1$);

    function Partial(filePath, namespace) {
        _classCallCheck(this, Partial);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Partial).call(this, filePath, path.basename(filePath, '_partial.hbs')));
        // TODO: make template extension configurable

        _this.namespace = namespace;
        return _this;
    }

    _createClass(Partial, [{
        key: 'load',
        value: function load() {
            var _this2 = this;

            return fsreadfile(this.filePath.toString()).then(function (buffer) {
                var content = buffer.toString();
                _this2.raw = content;
                var partialName = _this2.namespace + '.' + _this2.name;
                _this2.compiled = _this2.renderer.engine.precompile(_this2.raw);
                _this2.renderer.engine.registerPartial(partialName, _this2.raw);
                var renderer = _this2.renderer;
                _this2.registerable = renderer.registerablePartial(partialName, _this2.raw);
                return _this2;
            });
        }
    }], [{
        key: 'create',
        value: function create(filePath, namespace) {
            var partial = new Partial(filePath, namespace);
            partial.renderer = this.renderer;
            return partial;
        }
    }]);

    return Partial;
})(CompilableContent_1.CompilableContent);

exports.Partial = Partial;