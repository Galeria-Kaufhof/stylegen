"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var Node_1 = require('./Node');
/**
 * The StructureReader class serves as orchestrator to our styleguide class,
 * so that we can chain up the necessary steps which fill our styleguide structure appropriatly.
 */

var StructureReader = function () {
    function StructureReader(styleguide) {
        _classCallCheck(this, StructureReader);

        /** lets hold a reference to the parent styleguide */
        this.styleguide = styleguide;
    }
    /**
     * because all the configured folders and files in the styleguide configuration,
     * are realtive to the current working directory of the user, we need a little helper,
     * to look at the right place.
     */

    _createClass(StructureReader, [{
        key: 'fileInCWD',
        value: function fileInCWD(p) {
            return path.resolve(this.styleguide.config["cwd"], p);
        }
    }, {
        key: 'buildComponentDictionary',
        value: function buildComponentDictionary(nodes, dict) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var node = _step.value;

                    if (node.isComponent()) {
                        dict.set(node.component.id, node.component);
                    }
                    if (!!node.children) {
                        this.buildComponentDictionary(node.children, dict);
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
        /**
         * Collect all the little things, that represent out styleguide, e.g. components and pages
         */

    }, {
        key: 'collect',
        value: function collect() {
            var _this = this;

            var componentPaths = this.styleguide.config["componentPaths"];
            /**
             * a node is a sub entry in our component hierarchy, which may be a component or
             * just a category folder (or maybe just empty :/)
             */
            var nodeLookups = componentPaths.map(function (p) {
                var nodeConfig = {
                    styleguide: _this.styleguide
                };
                if (!!_this.styleguide.config.namespace) {
                    nodeConfig.namespace = _this.styleguide.config.namespace;
                }
                return new Node_1.Node(_this.fileInCWD(p), null, nodeConfig).resolve();
            });
            /**
             * Take all the root nodes and look forward to collect components and similar.
             */
            return Promise.all(nodeLookups).then(function (nodes) {
                /** assign nodes to the parent styleguide */
                _this.styleguide.nodes = nodes;
                _this.buildComponentDictionary(nodes, _this.styleguide.components);
                return _this;
            });
        }
    }]);

    return StructureReader;
}();

exports.StructureReader = StructureReader;
;