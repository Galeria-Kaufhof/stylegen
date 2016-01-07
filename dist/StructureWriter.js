"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs-extra');
var path = require('path');
var Logger_1 = require('./Logger');
var ComponentRegistry_1 = require('./ComponentRegistry');
var PlainComponentList_1 = require('./PlainComponentList');
var ContentStructureWriter_1 = require('./ContentStructureWriter');
/**
 * While the StructureReader concentrates on parsing the component directory for its structure
 * and inherent data, the StructureWriter is made for writing the resulting styleguide object down
 * to a target structure.
 */

var StructureWriter = function () {
    function StructureWriter(renderer, nodes, styleguide) {
        _classCallCheck(this, StructureWriter);

        this.nodes = nodes;
        this.renderer = renderer;
        this.styleguide = styleguide;
    }
    /**
     * Lets run through the several setup tasks, that should be done before writing any files.
     * At the moment it is mainly about registering the component templates inside the renderer.
     */

    _createClass(StructureWriter, [{
        key: 'setup',
        value: function setup() {
            var _this = this;

            return new ComponentRegistry_1.ComponentRegistry(this.renderer, this.nodes).setup().then(function (componentRegistry) {
                return _this;
            });
        }
        /**
         * Lets write down Components, Pages, etc.
         */

    }, {
        key: 'write',
        value: function write() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                var layoutContext = {};
                var type = 'plain';
                if (!!_this2.styleguide.config.dependencies) {
                    try {
                        layoutContext.cssDeps = _this2.styleguide.config.dependencies.styles;
                    } catch (e) {}
                    try {
                        layoutContext.jsDeps = _this2.styleguide.config.dependencies.js;
                    } catch (e) {}
                    if (!!_this2.styleguide.config.dependencies.templates) {
                        if (!!_this2.styleguide.config.dependencies.templates.head) {
                            try {
                                layoutContext.head = _this2.styleguide.config.dependencies.templates.head;
                                if (typeof layoutContext.head === "string") {
                                    layoutContext.head = [layoutContext.head];
                                }
                                layoutContext.head = layoutContext.head.map(function (file) {
                                    return fs.readFileSync(path.resolve(_this2.styleguide.config.cwd, file));
                                }).join('\n');
                            } catch (e) {
                                Logger_1.warn("StructureWriter.write: dependencies.head", e.message);
                                Logger_1.log(e.stack);
                            }
                        }
                        if (!!_this2.styleguide.config.dependencies.templates.bottom) {
                            try {
                                layoutContext.bottom = _this2.styleguide.config.dependencies.templates.bottom;
                                if (typeof layoutContext.bottom === "string") {
                                    layoutContext.bottom = [layoutContext.bottom];
                                }
                                layoutContext.bottom = layoutContext.bottom.map(function (file) {
                                    return fs.readFileSync(path.resolve(_this2.styleguide.config.cwd, file));
                                }).join('\n');
                            } catch (e) {
                                Logger_1.warn("StructureWriter.write: dependencies.bottom", e.message);
                                Logger_1.log(e.stack);
                            }
                        }
                    }
                }
                if (!!_this2.styleguide.config.content) {
                    type = "content-config";
                }
                var result;
                switch (type) {
                    case "content-config":
                        /** walk config, and build page objects */
                        result = new ContentStructureWriter_1.ContentStructureWriter(_this2.styleguide).walk(_this2.styleguide.config.content).then(function (contentStructureWriter) {
                            return contentStructureWriter.write(layoutContext);
                        });
                        break;
                    case "plain":
                    default:
                        result = new PlainComponentList_1.PlainComponentList(_this2.styleguide).build().then(function (plainListWriter) {
                            return plainListWriter.write(layoutContext);
                        });
                }
                return result.then(function () {
                    return resolve(_this2);
                }).catch(function (e) {
                    return reject(e);
                });
            });
        }
    }]);

    return StructureWriter;
}();

exports.StructureWriter = StructureWriter;