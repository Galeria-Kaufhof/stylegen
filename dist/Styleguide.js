"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var denodeify = require('denodeify');
var fs = require('fs-extra');
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
var fsensuredir = denodeify(fs.ensureDir);
var fscopy = denodeify(fs.copy);
var outputfile = denodeify(fs.outputFile);
var flatten = function flatten(list) {
    return list.reduce(function (a, b) {
        return a.concat(Array.isArray(b) ? flatten(b) : b);
    }, []);
};

var Styleguide = function () {
    // public docFactory: DocFactory;

    function Styleguide(options) {
        _classCallCheck(this, Styleguide);

        this.options = options;
        // nodes build the structure of our styleguide
        this.nodes = [];
        this.components = new ComponentList_1.ComponentList();
    }
    /*
     * Styleguide setup method to collect and merge configurations,
     * to set defaults and allow to overwrite them in the styleguide.json
     */

    _createClass(Styleguide, [{
        key: 'initialize',
        value: function initialize(cwd, stylegenRoot) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                var _ref;

                var configPath;
                if (!stylegenRoot) {
                    stylegenRoot = path.resolve(__dirname, '..');
                }
                if (!!_this.options && !!_this.options.configPath) {
                    configPath = _this.options.configPath;
                } else {
                    var jsonConfig = path.resolve(cwd, 'styleguide.json');
                    var yamlConfig = path.resolve(cwd, 'styleguide.yaml');
                    var stat;
                    try {
                        stat = fs.statSync(jsonConfig);
                    } catch (e) {}
                    configPath = !!stat ? jsonConfig : yamlConfig;
                }
                var configurations = [configPath, path.resolve(stylegenRoot, 'styleguide-defaults.yaml')];
                if (!!_this.options) {
                    configurations.unshift(_this.options);
                }
                /**
                 * retrieve the config and bootstrap the styleguide object.
                 */
                return (_ref = new Config_1.Config()).load.apply(_ref, configurations).then(function (mergedConfig) {
                    _this.config = mergedConfig;
                    /** lets assure, that we have the current working directory in reach for later access */
                    _this.config.cwd = cwd;
                    /** we sometimes need the stylegen root, e.g. for file resolvement */
                    _this.config.stylegenRoot = stylegenRoot;
                    _this.config.componentPaths.push(path.resolve(stylegenRoot, "styleguide-components"));
                    _this.config.target = path.resolve(cwd, _this.config.target);
                    /** each and every styleguide should have a name ;) */
                    if (!_this.config.name) {
                        _this.config.name = path.basename(_this.config.cwd);
                    }
                    if (!_this.config.version) {
                        _this.config.version = '0.0.1';
                    }
                    var rendererConfig = {};
                    rendererConfig.namespace = _this.config.namespace;
                    if (_this.config.partials) {
                        rendererConfig.partialLibs = _this.config.partials.map(function (p) {
                            try {
                                var partialLibPath = path.resolve(_this.config.cwd, p);
                                if (fs.statSync(partialLibPath)) {
                                    return require(partialLibPath);
                                }
                            } catch (e) {
                                Logger_1.warn("Styleguide.initialize", "not existing partial lib referenced");
                                return null;
                            }
                        });
                    }
                    _this.htmlRenderer = new HandlebarsRenderer_1.HandlebarsRenderer(rendererConfig);
                    _this.docRenderer = new MarkdownRenderer_1.MarkdownRenderer({ "htmlEngine": _this.htmlRenderer });
                    Doc_1.Doc.setRenderer(_this.docRenderer);
                    Partial_1.Partial.setRenderer(_this.htmlRenderer);
                    View_1.View.setRenderer(_this.htmlRenderer);
                    resolve(_this);
                }).catch(function (e) {
                    Logger_1.error("Styleguide.initialize:", e.message);
                    console.log(e.stack);
                    reject(e);
                });
            });
        }
        /*
         * walk the configured styleguide folders and read in the several components, pages, navigation, etc.,
         * and store the information inside the styleguide properties.
         */

    }, {
        key: 'read',
        value: function read() {
            var _this2 = this;

            /**
             * While this.nodes should represent our styleguide tree strucute, it is empty yet,
             * so lets start to fill it.
             *
             * A successful collect promise just resolves to `this`, so that we are able
             * to proceed with the information we collected in the read step.
             */
            return new StructureReader_1.StructureReader(this).collect().then(function (reader) {
                return _this2;
            });
        }
        /*
         * write down, what was read, so make sure you read before :)
         */

    }, {
        key: 'write',
        value: function write() {
            var _this3 = this;

            return new StructureWriter_1.StructureWriter(this.renderer, this.nodes, this).setup().then(function (structureWriter) {
                return structureWriter.write();
            }).then(function (result) {
                return _this3;
            });
        }
        /*
         * write down, what was read, so make sure you read before :)
         */

    }, {
        key: 'export',
        value: function _export() {
            var _this4 = this;

            Logger_1.success("Styleguide.export", "creating export ....");
            // TODO: move to Partial export function
            var partials = this.components.all().filter(function (c) {
                return c.config.namespace === _this4.config.namespace;
            }).filter(function (c) {
                return c.partials.length > 0;
            }).map(function (c) {
                return c.partials.map(function (p) {
                    return p.registerable;
                });
            });
            partials = flatten(partials);
            var partialsTemplate = 'exports.partials = function(engine, atob){\n      ' + partials.join("\n") + '\n    };';
            return outputfile(path.resolve('.', 'partials.js'), partialsTemplate).then(function () {
                return Promise.resolve(_this4);
            });
        }
        /*
         * write down, what was read, so make sure you read before :)
         */

    }, {
        key: 'prepare',
        value: function prepare() {
            var _this5 = this;

            return fsensuredir(path.resolve(this.config.cwd, this.config.target, 'assets')).then(function () {
                return fscopy(path.resolve(_this5.config.stylegenRoot, 'styleguide-assets'),
                // TODO: make "assets" path configurable
                path.resolve(_this5.config.cwd, _this5.config.target, 'stylegen-assets'));
            }).then(function () {
                if (!!_this5.config.assets) {
                    var copyPromises = _this5.config.assets.map(function (asset) {
                        return fscopy(path.resolve(_this5.config.cwd, asset.src), path.resolve(_this5.config.cwd, _this5.config.target, asset.target));
                    });
                    return Promise.all(copyPromises);
                } else {
                    Logger_1.warn("Styleguide.prepare", "No additional assets configured");
                    return Promise.resolve([]);
                }
            }).then(function () {
                return _this5;
            });
        }
    }]);

    return Styleguide;
}();

exports.Styleguide = Styleguide;