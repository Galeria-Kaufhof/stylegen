"use strict";
import * as fs from 'fs-extra';
import * as denodeify from 'denodeify';
import { error } from './Logger';
/** promisified readfile callback */
var fsreadfile = denodeify(fs.readFile);
/**
 * CompilableContent builds the abstract wrapper for compilable files,
 * like markdown documents, handlebars views and partials.
 */
export class CompilableContent {
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
            error("CompilableContent.render:", e);
            console.log(e.stack);
            throw (e);
        }
    }
}
