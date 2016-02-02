"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs-extra');
var denodeify = require('denodeify');
var Logger_1 = require('./Logger');
/** promisified readfile callback */
var fsreadfile = denodeify(fs.readFile);
/**
 * CompilableContent builds the abstract wrapper for compilable files,
 * like markdown documents, handlebars views and partials.
 */

var CompilableContent = function () {
    function CompilableContent(filePath, name) {
        _classCallCheck(this, CompilableContent);

        this.filePath = filePath;
        this.name = name;
    }

    _createClass(CompilableContent, [{
        key: 'load',
        value: function load() {
            var _this = this;

            return fsreadfile(this.filePath.toString()).then(function (buffer) {
                var content = buffer.toString();
                _this.raw = content;
                return _this;
            });
        }
    }, {
        key: 'render',
        value: function render() {
            try {
                return this.renderer.render(this.raw);
            } catch (e) {
                Logger_1.error("CompilableContent.render:", e);
                console.log(e.stack);
                throw e;
            }
        }
    }], [{
        key: 'setRenderer',
        value: function setRenderer(renderer) {
            this.renderer = renderer;
        }
    }]);

    return CompilableContent;
}();

exports.CompilableContent = CompilableContent;