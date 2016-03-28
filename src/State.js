import * as path from 'path';
import { Doc } from './Doc';
import * as changeCase from 'change-case';
export class State {
    constructor(id, component, config) {
        this.id = id;
        this.component = component;
        this.config = config;
        this.label = config.label;
        this.id = config.id || this.id;
        this.slug = `${this.component.slug}-${this.config.slug || this.id}`;
        this.context = config.context;
    }
    load() {
        // if state has a configured document just take it
        if (!!this.config.doc) {
            var p = path.resolve(this.component.config.path, this.component.config.componentDocs || ".", this.config.doc);
            let docName = path.basename(this.config.doc, '.md');
            return Doc.create(p, docName).load()
                .then((doc) => {
                this.doc = doc;
                return this;
            });
        }
        else {
            return this.component.docFiles()
                .then((files) => {
                var docs = files.filter((f) => {
                    f = path.basename(f, '.md');
                    if (changeCase.camel(f) === this.id) {
                        return true;
                    }
                    if (changeCase.snake(f) === this.id) {
                        return true;
                    }
                    if (changeCase.paramCase(f) === this.id) {
                        return true;
                    }
                    return false;
                });
                if (docs.length > 0) {
                    let f = docs[0];
                    let doc = path.basename(f, '.md');
                    let p = path.resolve(this.component.config.path, this.component.config.componentDocs || ".", f);
                    return Doc.create(p, doc).load()
                        .then((doc) => {
                        this.doc = doc;
                        return this;
                    });
                }
                else {
                    return this;
                }
            })
                .then(() => this);
        }
    }
}
