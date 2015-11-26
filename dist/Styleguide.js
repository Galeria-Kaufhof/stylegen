"use strict";
var path = require('path');
var fs = require('fs');
var denodeify = require('denodeify');
var fsExtra = require('fs-extra');
var Logger_1 = require('./Logger');
var Config_1 = require('./Config');
var StructureReader_1 = require('./StructureReader');
var StructureWriter_1 = require('./StructureWriter');
var ComponentList_1 = require('./ComponentList');
var Doc_1 = require('./Doc');
var Partial_1 = require('./Partial');
var View_1 = require('./View');
var MarkdownRenderer_1 = require('./MarkdownRenderer');
var HandlebarsRenderer_1 = require('./HandlebarsRenderer');
var mkdirs = denodeify(fsExtra.mkdirs);
var copy = denodeify(fsExtra.copy);
class Styleguide {
    // public docFactory: DocFactory;
    constructor(options) {
        // nodes build the structure of our styleguide
        this.nodes = [];
        this.components = new ComponentList_1.ComponentList();
    }
    /*
     * Styleguide setup method to collect and merge configurations,
     * to set defaults and allow to overwrite them in the styleguide.json
     */
    initialize(cwd, stylegenRoot) {
        return new Promise((resolve, reject) => {
            var jsonConfig = path.resolve(cwd, 'styleguide.json');
            var yamlConfig = path.resolve(cwd, 'styleguide.yaml');
            fs.exists(jsonConfig, (exists) => {
                var configPath = exists ? jsonConfig : yamlConfig;
                /**
                 * retrieve the config and bootstrap the styleguide object.
                 */
                new Config_1.Config()
                    .load(configPath, path.resolve(stylegenRoot, 'styleguide-defaults.yaml'))
                    .then((mergedConfig) => {
                    this.config = mergedConfig;
                    /** lets assure, that we have the current working directory in reach for later access */
                    this.config.cwd = cwd;
                    /** we sometimes need the stylegen root, e.g. for file resolvement */
                    this.config.stylegenRoot = stylegenRoot;
                    this.config.componentPaths.push(path.resolve(stylegenRoot, "styleguide-components"));
                    /** each and every styleguide should have a name ;) */
                    if (!this.config.name) {
                        this.config.name = path.basename(this.config.cwd);
                    }
                    var rendererConfig = {};
                    rendererConfig.namespace = this.config.namespace;
                    // TODO: hand in options for renderers
                    this.htmlRenderer = new HandlebarsRenderer_1.HandlebarsRenderer(rendererConfig);
                    this.docRenderer = new MarkdownRenderer_1.MarkdownRenderer({ "htmlEngine": this.htmlRenderer });
                    Doc_1.Doc.setRenderer(this.docRenderer);
                    Partial_1.Partial.setRenderer(this.htmlRenderer);
                    View_1.View.setRenderer(this.htmlRenderer);
                    resolve(this);
                })
                    .catch(function (e) {
                    console.log("Styleguide.initialize:", e);
                    reject(e);
                });
            });
        });
    }
    /*
     * walk the configured styleguide folders and read in the several components, pages, navigation, etc.,
     * and store the information inside the styleguide properties.
     */
    read() {
        /**
         * While this.nodes should represent our styleguide tree strucute, it is empty yet,
         * so lets start to fill it.
         *
         * A successful collect promise just resolves to `this`, so that we are able
         * to proceed with the information we collected in the read step.
         */
        return new StructureReader_1.StructureReader(this)
            .collect()
            .then((reader) => {
            return this;
        });
    }
    /*
     * write down, what was read, so make sure you read before :)
     */
    write() {
        return new StructureWriter_1.StructureWriter(this.renderer, this.nodes, this)
            .setup()
            .then((structureWriter) => {
            Logger_1.success("Styleguide.write", "writer setup finished");
            return structureWriter.write();
        })
            .then((result) => this);
    }
    /*
     * write down, what was read, so make sure you read before :)
     */
    prepare() {
        return mkdirs(path.resolve(this.config.cwd, this.config.target, 'assets'))
            .then(() => {
            return copy(path.resolve(this.config.stylegenRoot, 'styleguide-assets'), 
            // TODO: make "assets" path configurable
            path.resolve(this.config.cwd, this.config.target, 'assets'));
        })
            .then(() => {
            if (!!this.config.assets) {
                var copyPromises = this.config.assets.map((asset) => {
                    return copy(path.resolve(this.config.cwd, asset.src), path.resolve(this.config.cwd, this.config.target, asset.target));
                });
                return Promise.all(copyPromises);
            }
            else {
                Logger_1.warn("Styleguide.prepare", "No additional assets configured");
                return Promise.resolve([]);
            }
        })
            .then(() => {
            return this;
        });
    }
}
exports.Styleguide = Styleguide;
