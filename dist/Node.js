"use strict";
var path = require('path');
var fs = require('fs');
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
class Node {
    constructor(nodePath, parent, options) {
        this.parent = parent;
        this.options = options;
        var nodeName = path.basename(nodePath);
        this.id = nodeName;
        this.path = nodePath;
    }
    /**
     * recursive node lookup for a component path.
     */
    nodesForDirectories(file, parent) {
        var filePath = path.resolve(this.path, file);
        return fsstat(filePath)
            .then((stats) => {
            if (stats && stats.isDirectory()) {
                /** so, ok, we have a directory, so lets build the sub tree  */
                return new Node(filePath, parent, this.options).resolve();
            }
            else {
                return Promise.resolve(null);
            }
        });
    }
    /**
     * Find out if a node has a component configurations and create a Component, if it is so.
     */
    resolveComponent() {
        var componentConfigPath = this.files.find((x) => x == 'component.json');
        if (!componentConfigPath) {
            componentConfigPath = this.files.find((x) => x == 'component.yaml');
        }
        if (!!componentConfigPath) {
            // TODO: merge in default configuration for components
            return new Config_1.Config().load(path.resolve(this.path, componentConfigPath))
                .then((config) => {
                var parentComponent;
                /**
                 * attach the current path to the config, to make it
                 * available to the component.
                 */
                config.path = this.path;
                /**
                 * namespace can be configured in component.json,
                 * if it is not, take the configured namespace of the project config.
                 * If it is also  not set, take app as default.
                 */
                if (!config.namespace && !!this.options.namespace) {
                    config.namespace = this.options.namespace;
                }
                else if (!config.namespace) {
                    config.namespace = 'app';
                }
                /**
                 * if the parent node is also a component, lets handle this node
                 * as sub component to the parent one.
                 */
                if (!!this.parent && this.parent.isComponent()) {
                    parentComponent = this.parent.component;
                }
                return new Component_1.Component(config, parentComponent).build()
                    .then((component) => {
                    this.component = component;
                    return this;
                });
            });
        }
        else {
            return Promise.resolve(this);
        }
        ;
    }
    resolveChildren() {
        /**
         * because we have handled the current levels component.json already,
         * lets handle the other files without taking it into account again.
         */
        var alreadyProcessed = ['component.json'];
        /**
         * add partials to those files, which are already handled in the beforehand component lookup
         */
        if (this.isComponent() && !!this.component.partials) {
            var partialNames = this.component.partials.map((p) => p.name);
            [].push.apply(alreadyProcessed, this.component.partials.map((p) => p.name));
        }
        /**
         * Lets handle the leftover files, (at the moment it should only be sub folders, that may be child nodes)
         */
        var filePromises = this.files
            .filter((f) => { return alreadyProcessed.indexOf(f) < 0; })
            .map((f) => { return this.nodesForDirectories(f, this); });
        return Promise.all(filePromises)
            .then((childNodes) => {
            this.children = childNodes.filter(n => n !== null);
            return this;
        });
    }
    isComponent() {
        return !!this.component;
    }
    resolve() {
        /**
         * get all files inside this node, and go on.
         */
        return fsreaddir(this.path)
            .then((files) => {
            this.files = files;
            /**
             * lets resolve the component parts of this node, like component.json
             * and referenced partials, etc.
             */
            return this.resolveComponent();
        })
            .then((node) => {
            return this.resolveChildren();
        });
    }
}
exports.Node = Node;
