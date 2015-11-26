"use strict";
var path = require('path');
var Logger_1 = require('./Logger');
var Partial_1 = require('./Partial');
var View_1 = require('./View');
var Doc_1 = require('./Doc');
/**
 * Components are the representation of the real asset components,
 * that are represented by a component.json file inside of an component folder.
 * A Component has a one-to-one relationship to a Node.
 */
class Component {
    /**
     * @param config - the parsed component.json file, enriched with current path and namespace.
     * @param parent - the parent is used to distuingish components and "sub"-components
     */
    constructor(config, parent) {
        this.config = config;
        /** TODO: handle parent resolution and sub component naming, atm. it is useless */
        this.id = this.config.id || path.basename(config.path);
        this.slug = `${this.config.namespace}-${this.id}`;
        this.id = `${this.config.namespace}.${this.id}`;
        this.tags = this.config.tags;
    }
    /**
     * a component may have several partials, that are component related view snippets,
     * that are reusable by other partials or view components.
     */
    buildPartials() {
        if (!!this.config.partials) {
            /**
             * load all Partials
             */
            var partialPromises = this.config.partials.map((partialName) => {
                var p = path.resolve(this.config.path, partialName);
                /** add partial loading promise to promise collection */
                return Partial_1.Partial.create(p, this.config.namespace).load();
            });
            return Promise.all(partialPromises)
                .then((partials) => {
                this.partials = partials;
                return this;
            });
        }
        else if (!this.config.partials) {
            // TODO: try to find  *_partial files in component path (this.config.path)
            this.partials = [];
            return Promise.resolve(this);
        }
        else {
            this.partials = [];
            Logger_1.warn("WARN:", "Component.buildPartials", "Did not found any partials for Component", this.id);
            return Promise.resolve(this);
        }
    }
    /**
     * at the moment a Component can have exactly one view,
     * that is available later as executable js function.
     *
     * A view is not reusable directly in other views,
     * to have a reusable snippet, register a Partial instead.
     */
    buildView() {
        if (!!this.config.view) {
            var p = path.resolve(this.config.path, this.config.view);
            return View_1.View.create(p).load()
                .then((view) => {
                this.view = view;
                return this;
            });
        }
        else if (!this.config.view) {
            // TODO: try to find  *_view files in component path (this.config.path)
            return Promise.resolve(this);
        }
        else {
            Logger_1.warn("WARN:", "Component.buildView", "Did not found a view for Component", this.id);
            return Promise.resolve(this);
        }
    }
    /**
     */
    buildDocs() {
        if (!!this.config.docs) {
            /**
             * load all Docs
             */
            var docs = this.config.docs;
            var docPromises = Object.keys(docs).map((doc) => {
                var p = path.resolve(this.config.path, docs[doc]);
                /** add partial loading promise to promise collection */
                return Doc_1.Doc.create(p, doc).load();
            });
            return Promise.all(docPromises)
                .then((loadedDocs) => {
                this.docs = loadedDocs;
                return this;
            });
        }
        else {
            this.docs = [];
            if (!!this.config.namespace && this.config.namespace != 'sg') {
                Logger_1.warn("WARN:", "Component.buildDocs", "Did not found any docs for Component", this.id);
            }
            return Promise.resolve(this);
        }
    }
    /**
     * building a component means to retrieve the flesh and bones of the component,
     * that are described in its config
     *
     * --> Its Partials, its View, and later all other related stuff.
     */
    build() {
        /** resolve the component partials at first */
        return this.buildPartials()
            .then(() => this.buildView())
            .then(() => this.buildDocs());
    }
}
exports.Component = Component;
