"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Remarkable = require('remarkable');
var RemarkableStylegen_1 = require('./lib/RemarkableStylegen');
var md = new Remarkable({ quotes: '', html: true });
/**
 * Build in renderer, that is taken as default if no external is given.
 */

var MarkdownRenderer = function () {
    function MarkdownRenderer(options) {
        _classCallCheck(this, MarkdownRenderer);

        this.options = options;
        if (!!options && !!options.htmlEngine) {
            md.use(RemarkableStylegen_1.RemarkableStylegen(options.htmlEngine.engine));
        }
    }

    _createClass(MarkdownRenderer, [{
        key: 'render',
        value: function render(raw) {
            return md.render(raw);
        }
    }]);

    return MarkdownRenderer;
}();

exports.MarkdownRenderer = MarkdownRenderer;