"use strict";
var fs = require('fs-extra');
var path = require('path');
var slug = require('slug');
var denodeify = require('denodeify');
var Doc_1 = require('./Doc');
var PlainComponentList_1 = require('./PlainComponentList');
var fsoutputfile = denodeify(fs.outputFile);
class Page {
    constructor(config, parent) {
        this.config = config;
        this.parent = parent;
        this.mdRenderer = this.config.mdRenderer;
        this.label = this.config.label;
        this.slug = slug(this.label.toLowerCase());
        if (!parent && this.config.target) {
            this.target = this.config.target;
        }
        else if (!!parent) {
            this.target = path.resolve(path.dirname(parent.target), parent.slug);
        }
        else {
            throw ("No target for the styleguide specified");
        }
        this.target = path.resolve(this.target, this.slug + '.html');
        this.link = path.resolve("/", path.relative(this.config.styleguide.config.target, this.target));
    }
    resolveChildren() {
        if (!!this.config.children && this.config.children.length > 0) {
            return Promise.all(this.config.children.map((childPageConfig) => {
                childPageConfig.styleguide = this.config.styleguide;
                return new Page(childPageConfig, this).build();
            }))
                .then(children => {
                this.children = children;
                return this;
            });
        }
        else {
            return Promise.resolve(this);
        }
    }
    buildContent() {
        var contentPromise;
        // var docFactory = this.config.styleguide.docFactory;
        switch (this.config.type) {
            case "md":
                contentPromise = Doc_1.Doc.create(path.resolve(this.config.content), this.config.label).load()
                    .then((doc) => {
                    var pageLayout = this.config.styleguide.components.find('sg.page').view.template;
                    doc.compiled = pageLayout({ content: doc.compiled });
                    return doc;
                });
                break;
            case "tags":
                contentPromise = new PlainComponentList_1.PlainComponentList(this.config.styleguide).build(this.config.content);
                break;
            default:
                /** FOR UNKNOWN TYPES */
                console.error("Page.buildContent - config.type unknown", this.config.type);
                contentPromise = Promise.resolve(this);
        }
        return contentPromise.then((content) => {
            this.content = content.compiled;
            return this;
        });
    }
    build() {
        return this.resolveChildren()
            .then((page) => this.buildContent())
            .then(() => { return this; });
    }
    writeChildren(layout, context) {
        if (!!this.children) {
            return Promise.all(this.children.map((child) => child.write(layout, context)))
                .then(children => this);
        }
        else {
            return Promise.resolve(this);
        }
    }
    write(layout, context) {
        var pageContext = Object.assign({}, context);
        pageContext.content = this.content;
        /** applying here, because of stupid method defintion with multiargs :/ */
        return fsoutputfile.apply(this, [this.target, layout(pageContext)])
            .then(page => this.writeChildren(layout, context))
            .then((file) => this);
    }
}
exports.Page = Page;
