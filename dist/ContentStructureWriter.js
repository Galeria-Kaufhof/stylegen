"use strict";
var Page_1 = require('./Page');
class ContentStructureWriter {
    constructor(styleguide) {
        this.styleguide = styleguide;
    }
    /**
     * walk config, and build page objects
     */
    walk(content) {
        return Promise.all(content.map((pageConfig) => {
            pageConfig.styleguide = this.styleguide;
            pageConfig.target = this.styleguide.config.target;
            return new Page_1.Page(pageConfig).build();
        }))
            .then((pages) => {
            this.pages = pages;
            return this;
        });
    }
    write(context) {
        context.pages = this.pages;
        var layout = this.styleguide.components.find('sg.layout').view.template;
        return Promise.all(this.pages.map(page => page.write(layout, context)))
            .then(pages => this);
    }
}
exports.ContentStructureWriter = ContentStructureWriter;
