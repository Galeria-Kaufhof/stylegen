"use strict";
var path = require('path');
var fs = require('fs-extra');
var denodeify = require('denodeify');
var fsreaddir = denodeify(fs.readdir);
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
     */
    constructor(config, node) {
        this.config = config;
        this.node = node;
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
        var partialPromises;
        if (!!this.config.partials) {
            /**
             * load all Partials
             */
            partialPromises = this.config.partials.map((partialName) => {
                var p = path.resolve(this.config.path, partialName);
                /** add partial loading promise to promise collection */
                return Partial_1.Partial.create(p, this.config.namespace).load();
            });
        }
        else if (!this.config.partials) {
            // TODO: make _partial suffix configurable, along with the other references to it
            partialPromises = this.node.files.filter(x => new RegExp("^.*?_partial.hbs$").test(x)).map((partialName) => {
                var p = path.resolve(this.config.path, partialName);
                return Partial_1.Partial.create(p, this.config.namespace).load();
            });
        }
        else {
            this.partials = [];
            return Promise.resolve(this);
        }
        return Promise.all(partialPromises)
            .then((partials) => {
            this.partials = partials;
            return this;
        });
    }
    /**
     * at the moment a Component can have exactly one view,
     * that is available later as executable js function.
     *
     * A view is not reusable directly in other views,
     * to have a reusable snippet, register a Partial instead.
     */
    buildView() {
        var viewPath;
        if (!!this.config.view) {
            viewPath = path.resolve(this.config.path, this.config.view);
        }
        else if (!this.config.view) {
            viewPath = this.node.files.find(x => new RegExp("^view.hbs$").test(x));
        }
        else {
            Logger_1.warn("WARN:", "Component.buildView", "Did not found a view for Component, the component will NOT be listed in the Styleguide", this.id);
            return Promise.resolve(this);
        }
        return View_1.View.create(viewPath).load()
            .then((view) => {
            this.view = view;
            return this;
        });
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
