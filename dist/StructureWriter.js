"use strict";
var fs = require('fs-extra');
var path = require('path');
var ComponentRegistry_1 = require('./ComponentRegistry');
var PlainComponentList_1 = require('./PlainComponentList');
var ContentStructureWriter_1 = require('./ContentStructureWriter');
/**
 * While the StructureReader concentrates on parsing the component directory for its structure
 * and inherent data, the StructureWriter is made for writing the resulting styleguide object down
 * to a target structure.
 */
class StructureWriter {
    constructor(renderer, nodes, styleguide) {
        this.nodes = nodes;
        this.renderer = renderer;
        this.styleguide = styleguide;
    }
    /**
     * Lets run through the several setup tasks, that should be done before writing any files.
     * At the moment it is mainly about registering the component templates inside the renderer.
     */
    setup() {
        return new ComponentRegistry_1.ComponentRegistry(this.renderer, this.nodes).setup()
            .then(componentRegistry => this);
    }
    /**
     * Lets write down Components, Pages, etc.
     */
    write() {
        return new Promise((resolve, reject) => {
            var layoutContext = {};
            var type = 'plain';
            try {
                layoutContext.cssDeps = this.styleguide.config.dependencies.styles;
            }
            catch (e) { }
            try {
                layoutContext.jsDeps = this.styleguide.config.dependencies.js;
            }
            catch (e) { }
            try {
                layoutContext.head = this.styleguide.config.dependencies.templates.head;
                if (typeof layoutContext.head === "string") {
                    layoutContext.head = [layoutContext.head];
                }
                layoutContext.head = layoutContext.head.map(file => fs.readFileSync(path.resolve(this.styleguide.config.cwd, file))).join('\n');
            }
            catch (e) { }
            if (!!this.styleguide.config.content) {
                type = "content-config";
            }
            var result;
            switch (type) {
                case "content-config":
                    /** walk config, and build page objects */
                    result = new ContentStructureWriter_1.ContentStructureWriter(this.styleguide)
                        .walk(this.styleguide.config.content)
                        .then(contentStructureWriter => contentStructureWriter.write(layoutContext));
                    break;
                case "plain":
                default:
                    result = new PlainComponentList_1.PlainComponentList(this.styleguide).build()
                        .then((plainListWriter) => plainListWriter.write(layoutContext));
            }
            return result
                .then(() => resolve(this))
                .catch((e) => reject(e));
        });
    }
}
exports.StructureWriter = StructureWriter;
