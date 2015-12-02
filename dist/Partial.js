"use strict";
var path = require('path');
var fs = require('fs-extra');
var denodeify = require('denodeify');
var CompilableContent_1 = require('./CompilableContent');
var fsreadfile = denodeify(fs.readFile);
class Partial extends CompilableContent_1.CompilableContent {
    constructor(filePath, namespace) {
        // TODO: make template extension configurable
        super(filePath, path.basename(filePath, '_partial.hbs'));
        this.namespace = namespace;
    }
    load() {
        return fsreadfile(this.filePath.toString())
            .then((buffer) => {
            var content = buffer.toString();
            this.raw = content;
            var partialName = `${this.namespace}.${this.name}`;
            this.compiled = this.renderer.engine.precompile(this.raw);
            this.renderer.engine.registerPartial(partialName, this.raw);
            var renderer = this.renderer;
            this.registerable = renderer.registerablePartial(partialName, this.raw);
            return this;
        });
    }
    static create(filePath, namespace) {
        var partial = new Partial(filePath, namespace);
        partial.renderer = this.renderer;
        return partial;
    }
}
exports.Partial = Partial;
