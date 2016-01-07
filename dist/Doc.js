"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var fs = require('fs-extra');
var denodeify = require('denodeify');
var CompilableContent_1 = require('./CompilableContent');
var Logger_1 = require('./Logger');
var fsreadfile = denodeify(fs.readFile);

var Doc = function (_CompilableContent_1$) {
    _inherits(Doc, _CompilableContent_1$);

    function Doc() {
        _classCallCheck(this, Doc);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Doc).apply(this, arguments));
    }

    _createClass(Doc, [{
        key: 'load',
        value: function load() {
            var _this2 = this;

            return fsreadfile(this.filePath.toString()).then(function (buffer) {
                var content = buffer.toString();
                _this2.raw = content;
                _this2.compiled = _this2.render();
                return _this2;
            }).catch(function (e) {
                Logger_1.error("Doc.load", e);
                console.log(e.stack);
                throw e;
            });
        }
    }], [{
        key: 'create',
        value: function create(path, name) {
            var doc = new Doc(path, name);
            doc.renderer = this.renderer;
            return doc;
        }
    }]);

    return Doc;
}(CompilableContent_1.CompilableContent);

exports.Doc = Doc;