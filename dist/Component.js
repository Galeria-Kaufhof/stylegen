"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var fs = require('fs-extra');
var denodeify = require('denodeify');
var fsreaddir = denodeify(fs.readdir);
var Partial_1 = require('./Partial');
var View_1 = require('./View');
var Doc_1 = require('./Doc');
var State_1 = require('./State');
/**
 * Components are the representation of the real asset components,
 * that are represented by a component.json file inside of an component folder.
 * A Component has a one-to-one relationship to a Node.
 */

var Component = function () {
    /**
     * @param config - the parsed component.json file, enriched with current path and namespace.
     */

    function Component(config, node) {
        _classCallCheck(this, Component);

        this.config = config;
        this.node = node;
        this.id = this.config.id || path.basename(config.path);
        this.slug = this.config.namespace + '-' + this.id;
        this.id = this.config.namespace + '.' + this.id;
        this.tags = this.config.tags;
    }
    /**
     * a component may have several partials, that are component related view snippets,
     * that are reusable by other partials or view components.
     */

    _createClass(Component, [{
        key: 'buildPartials',
        value: function buildPartials() {
            var _this = this;

            var partialPromises;
            if (!!this.config.partials) {
                /**
                 * load all Partials
                 */
                partialPromises = this.config.partials.map(function (partialName) {
                    var p = path.resolve(_this.config.path, partialName);
                    return Partial_1.Partial.create(p, _this.config.namespace).load();
                });
            } else {
                // TODO: make _partial suffix configurable, along with the other references to it
                partialPromises = this.node.files.filter(function (x) {
                    return new RegExp("^.*?_partial.hbs$").test(x);
                }).map(function (partialName) {
                    var p = path.resolve(_this.config.path, partialName);
                    return Partial_1.Partial.create(p, _this.config.namespace).load();
                });
            }
            return Promise.all(partialPromises).then(function (partials) {
                _this.partials = partials;
                return _this;
            });
        }
        /**
         * at the moment a Component can have exactly one view,
         * that is available later as executable js function.
         *
         * A view is not reusable directly in other views,
         * to have a reusable snippet, register a Partial instead.
         */

    }, {
        key: 'buildView',
        value: function buildView() {
            var _this2 = this;

            var viewPath;
            if (!!this.config.view) {
                viewPath = path.resolve(this.config.path, this.config.view);
            } else {
                viewPath = this.node.files.find(function (x) {
                    return new RegExp("^view.hbs$").test(x);
                });
                if (!viewPath) {
                    return Promise.resolve(this);
                }
                viewPath = path.resolve(this.config.path, viewPath);
            }
            return View_1.View.create(viewPath).load().then(function (view) {
                _this2.view = view;
                return _this2;
            });
        }
        /**
         */

    }, {
        key: 'buildDocs',
        value: function buildDocs() {
            var _this3 = this;

            var docPromises;
            if (!!this.config.docs) {
                /**
                 * load all Docs
                 */
                var docs = this.config.docs;
                docPromises = Object.keys(docs).map(function (doc) {
                    var p = path.resolve(_this3.config.path, docs[doc]);
                    /** add partial loading promise to promise collection */
                    return Doc_1.Doc.create(p, doc).load();
                });
            } else {
                docPromises = this.node.files.filter(function (x) {
                    return new RegExp("^.*?.md$").test(x);
                }).map(function (doc) {
                    var p = path.resolve(_this3.config.path, doc);
                    return Doc_1.Doc.create(p, doc).load();
                });
            }
            return Promise.all(docPromises).then(function (loadedDocs) {
                _this3.docs = loadedDocs;
                return _this3;
            });
        }
        /**
         */

    }, {
        key: 'buildStates',
        value: function buildStates() {
            var _this4 = this;

            var statePromises;
            if (!!this.config.states) {
                /** prepare states (and especially their docs) */
                statePromises = Object.keys(this.config.states).map(function (id) {
                    var config = _this4.config.states[id];
                    return new State_1.State(id, _this4, config).load();
                });
            } else {
                statePromises = [Promise.resolve(null)];
            }
            return Promise.all(statePromises).then(function (loadedStates) {
                _this4.states = loadedStates;
                return _this4;
            });
        }
        /**
         * building a component means to retrieve the flesh and bones of the component,
         * that are described in its config
         *
         * --> Its Partials, its View, and later all other related stuff.
         */

    }, {
        key: 'build',
        value: function build() {
            var _this5 = this;

            /** resolve the component partials at first */
            return this.buildPartials().then(function () {
                return _this5.buildView();
            }).then(function () {
                return _this5.buildStates();
            }).then(function () {
                return _this5.buildDocs();
            });
        }
    }]);

    return Component;
}();

exports.Component = Component;