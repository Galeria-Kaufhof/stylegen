"use strict";
var fs = require('fs');
var denodeify = require('denodeify');
var Logger_1 = require('./Logger');
var fsreadfile = denodeify(fs.readFile);
class CompilableContent {
    constructor(filePath, name) {
        this.filePath = filePath;
        this.name = name;
    }
    static setRenderer(renderer) {
        this.renderer = renderer;
    }
    load() {
        return fsreadfile(this.filePath.toString())
            .then((buffer) => {
            var content = buffer.toString();
            this.raw = content;
            return this;
        });
    }
    render() {
        try {
            return this.renderer.render(this.raw);
        }
        catch (e) {
            Logger_1.error("CompilableContent.render:", e);
            console.log(e.stack);
            throw (e);
        }
    }
}
exports.CompilableContent = CompilableContent;
