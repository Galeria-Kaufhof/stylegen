"use strict";
var Remarkable = require('remarkable');
var RemarkableStylegen_1 = require('./lib/RemarkableStylegen');
var md = new Remarkable({ quotes: '', html: true });
/**
 * Build in renderer, that is taken as default if no external is given.
 */
class MarkdownRenderer {
    constructor(options) {
        this.options = options;
        if (!!options && !!options.htmlEngine) {
            md.use(RemarkableStylegen_1.RemarkableStylegen(options.htmlEngine.engine));
        }
    }
    render(raw) {
        return md.render(raw);
    }
}
exports.MarkdownRenderer = MarkdownRenderer;
