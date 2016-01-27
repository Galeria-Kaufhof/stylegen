"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs-extra');
var path = require('path');
var slug = require('slug');
var denodeify = require('denodeify');
var Doc_1 = require('./Doc');
var PlainComponentList_1 = require('./PlainComponentList');
var Logger_1 = require('./Logger');
var fsoutputfile = denodeify(fs.outputFile);

var Page = function () {
    function Page(config, parent) {
        _classCallCheck(this, Page);

        this.config = config;
        this.parent = parent;
        this.mdRenderer = this.config.mdRenderer;
        this.label = this.config.label;
        this.id = this.config.id || slug(this.config.label.toLowerCase());
        // this.slug = `${this.config.styleguide.config.namespace}-${this.config.slug || slug(this.id.toLowerCase())}`;
        this.slug = this.config.slug || this.id;
        if (!parent && this.config.target) {
            this.target = this.config.target;
        } else if (!!parent) {
            this.target = path.resolve(path.dirname(parent.target), parent.slug);
        } else {
            throw "No target for the styleguide specified";
        }
        this.root = this.config.styleguide.config.target;
        this.cwd = this.target;
        // TODO: target should stay the folder, whereas link should be used to reference the file
        this.target = path.resolve(this.target, this.slug + '.html');
        this.link = this.target;
    }

    _createClass(Page, [{
        key: 'resolveChildren',
        value: function resolveChildren() {
            var _this = this;

            if (!!this.config.children && this.config.children.length > 0) {
                return Promise.all(this.config.children.map(function (childPageConfig) {
                    childPageConfig.styleguide = _this.config.styleguide;
                    return new Page(childPageConfig, _this).build();
                })).then(function (children) {
                    _this.children = children;
                    return _this;
                });
            } else {
                return Promise.resolve(this);
            }
        }
    }, {
        key: 'buildComponentList',
        value: function buildComponentList(options) {
            // options = Object.assign({}, options, { page: this.layoutContext });
            options = Object.assign({}, options);
            return new PlainComponentList_1.PlainComponentList(this.config.styleguide).build(options);
        }
    }, {
        key: 'buildContent',
        value: function buildContent() {
            var _this2 = this;

            var contentPromise;
            // var docFactory = this.config.styleguide.docFactory;
            try {
                switch (this.config.type) {
                    case "md":
                        contentPromise = Doc_1.Doc.create(path.resolve(this.config.styleguide.config.cwd, this.config.content), this.config.label).load().then(function (doc) {
                            var ctx = Object.assign({}, _this2.config, { content: doc.compiled });
                            var pageLayout = _this2.config.styleguide.components.find('sg.page').view.template;
                            doc.compiled = pageLayout(ctx);
                            return doc;
                        });
                        break;
                    case "tags":
                        contentPromise = this.buildComponentList({ label: this.label, tags: this.config.content });
                        break;
                    case "components":
                        if (!!this.config.preflight) {
                            contentPromise = Doc_1.Doc.create(path.resolve(this.config.styleguide.config.cwd, this.config.preflight), this.config.label).load().then(function (preflight) {
                                return _this2.buildComponentList({ label: _this2.label, components: _this2.config.content, preflight: preflight.compiled });
                            });
                        } else {
                            contentPromise = this.buildComponentList({ label: this.label, components: this.config.content });
                        }
                        break;
                    default:
                        /** FOR UNKNOWN TYPES */
                        Logger_1.warn("Page.buildContent - config.type unknown", this.config.type);
                        contentPromise = Promise.resolve(null);
                }
            } catch (e) {
                return Promise.reject(e);
            }
            return contentPromise.then(function (content) {
                if (content !== null) {
                    if (content instanceof PlainComponentList_1.PlainComponentList) {
                        _this2.componentList = content;
                    }
                    _this2.content = content;
                }
                return _this2;
            });
        }
    }, {
        key: 'build',
        value: function build() {
            var _this3 = this;

            return this.resolveChildren().then(function (page) {
                return _this3.buildContent();
            }).then(function () {
                return _this3;
            });
        }
    }, {
        key: 'writeChildren',
        value: function writeChildren(layout, context) {
            var _this4 = this;

            if (!!this.children) {
                return Promise.all(this.children.map(function (child) {
                    return child.write(layout, context);
                })).then(function (children) {
                    return _this4;
                });
            } else {
                return Promise.resolve(this);
            }
        }
    }, {
        key: 'write',
        value: function write(layout, context) {
            var _this5 = this;

            if (!!this.content) {
                var preparation;
                var pageContext = Object.assign({}, context);
                /** root and cwd are important properties for the relative link helper we made available in the handlebars engine */
                pageContext.root = this.root;
                pageContext.cwd = this.cwd;
                if (this.content instanceof PlainComponentList_1.PlainComponentList) {
                    preparation = this.componentList.render(pageContext).then(function (plainComponentList) {
                        pageContext.content = plainComponentList.compiled;
                    });
                } else {
                    pageContext.content = this.content.compiled;
                    preparation = Promise.resolve(this);
                }
                /** applying here, because of stupid type defintion with multiargs :/ */
                preparation.then(function (page) {
                    return fsoutputfile.apply(_this5, [_this5.target, layout(pageContext)]);
                }).then(function (page) {
                    return _this5.writeChildren(layout, context);
                }).then(function (file) {
                    return _this5;
                }).catch(function (e) {
                    return Logger_1.error("OMG", e.stack);
                });
            } else {
                return Promise.resolve(this);
            }
        }
    }]);

    return Page;
}();

exports.Page = Page;