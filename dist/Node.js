"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var fs = require('fs-extra');
var denodeify = require('denodeify');
var Config_1 = require('./Config');
var Component_1 = require('./Component');
var fsstat = denodeify(fs.stat);
var fsreaddir = denodeify(fs.readdir);
/**
 * a Node represents a folder-node inside of the configured component paths.
 * It may have a Component (1-to-1), but maybe it is just a container for
 * child nodes, that are components.
 *
 * TODO: i guess nodes may also be pages
 */

var Node = function () {
    function Node(nodePath, parent, options) {
        _classCallCheck(this, Node);

        this.parent = parent;
        this.options = options;
        var nodeName = path.basename(nodePath);
        this.id = nodeName;
        this.path = nodePath;
    }
    /**
     * recursive node lookup for a component path.
     */


    _createClass(Node, [{
        key: 'nodesForDirectories',
        value: function nodesForDirectories(file, parent) {
            var _this = this;

            var filePath = path.resolve(this.path, file);
            return fsstat(filePath).then(function (stats) {
                if (stats && stats.isDirectory()) {
                    /** so, ok, we have a directory, so lets build the sub tree  */
                    return new Node(filePath, parent, _this.options).resolve();
                } else {
                    return Promise.resolve(null);
                }
            });
        }
        /**
         * Find out if a node has a component configurations and create a Component, if it is so.
         */

    }, {
        key: 'resolveComponent',
        value: function resolveComponent() {
            var _this2 = this;

            var componentConfigPath = this.files.find(function (x) {
                return x == 'component.json';
            });
            if (!componentConfigPath) {
                componentConfigPath = this.files.find(function (x) {
                    return x == 'component.yaml';
                });
            }
            if (!!componentConfigPath) {
                // TODO: merge in default configuration for components
                return new Config_1.Config().load(path.resolve(this.path, componentConfigPath)).then(function (config) {
                    var parentComponent;
                    /**
                     * attach the current path to the config, to make it
                     * available to the component.
                     */
                    config.path = _this2.path;
                    /**
                     * namespace can be configured in component.json,
                     * if it is not, take the configured namespace of the project config.
                     * If it is also  not set, take app as default.
                     */
                    if (!config.namespace && !!_this2.options.namespace) {
                        config.namespace = _this2.options.namespace;
                    } else if (!config.namespace) {
                        config.namespace = 'app';
                    }
                    return new Component_1.Component(config, _this2).build().then(function (component) {
                        _this2.component = component;
                        return _this2;
                    });
                });
            } else {
                return Promise.resolve(this);
            }
            ;
        }
    }, {
        key: 'resolveChildren',
        value: function resolveChildren() {
            var _this3 = this;

            /**
             * because we have handled the current levels component.json already,
             * lets handle the other files without taking it into account again.
             */
            var alreadyProcessed = ['component.json'];
            /**
             * add partials to those files, which are already handled in the beforehand component lookup
             */
            if (this.isComponent() && !!this.component.partials) {
                var partialNames = this.component.partials.map(function (p) {
                    return p.name;
                });
                [].push.apply(alreadyProcessed, this.component.partials.map(function (p) {
                    return p.name;
                }));
            }
            /**
             * Lets handle the leftover files, (at the moment it should only be sub folders, that may be child nodes)
             */
            var filePromises = this.files.filter(function (f) {
                return alreadyProcessed.indexOf(f) < 0;
            }).map(function (f) {
                return _this3.nodesForDirectories(f, _this3);
            });
            return Promise.all(filePromises).then(function (childNodes) {
                _this3.children = childNodes.filter(function (n) {
                    return n !== null;
                });
                return _this3;
            });
        }
    }, {
        key: 'isComponent',
        value: function isComponent() {
            return !!this.component;
        }
    }, {
        key: 'resolve',
        value: function resolve() {
            var _this4 = this;

            /**
             * get all files inside this node, and go on.
             */
            return fsreaddir(this.path).then(function (files) {
                _this4.files = files;
                /**
                 * lets resolve the component parts of this node, like component.json
                 * and referenced partials, etc.
                 */
                return _this4.resolveComponent();
            }).then(function (node) {
                return _this4.resolveChildren();
            });
        }
    }]);

    return Node;
}();

exports.Node = Node;