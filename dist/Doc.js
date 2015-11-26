"use strict";
var fs = require('fs');
var denodeify = require('denodeify');
var CompilableContent_1 = require('./CompilableContent');
var Logger_1 = require('./Logger');
var fsreadfile = denodeify(fs.readFile);
class Doc extends CompilableContent_1.CompilableContent {
    load() {
        return fsreadfile(this.filePath.toString())
            .then((buffer) => {
            var content = buffer.toString();
            this.raw = content;
            this.compiled = this.render();
            return this;
        })
            .catch(e => {
            Logger_1.error("Doc.load", e);
            console.log(e.stack);
            throw (e);
        });
    }
    static create(path, name) {
        var doc = new Doc(path, name);
        doc.renderer = this.renderer;
        return doc;
    }
}
exports.Doc = Doc;
