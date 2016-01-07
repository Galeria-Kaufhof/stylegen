"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentRegistry = function () {
    // this.styleguide = styleguide;

    function ComponentRegistry(renderer, nodes) {
        _classCallCheck(this, ComponentRegistry);

        this.nodes = nodes;
        this.renderer = renderer;
        // this.styleguide = styleguide;
    }
    /**
     * to have the components ready to be build,
     * we have to announce them to the renderer, so that the resolution
     * of partials, etc. works as expected.
     */

    _createClass(ComponentRegistry, [{
        key: "registerComponents",
        value: function registerComponents(nodes) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var node = _step.value;

                    if (node.isComponent()) {}
                    /** run through the node tree and register childrens, and childrens childrent, and ... */
                    if (!!node.children) {
                        this.registerComponents(node.children);
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
         * before we start to write the styleguide components, we will do the necessary setup tasks,
         * like renderer setup and anything else, that has to be done in beforehand.
         */

    }, {
        key: "setup",
        value: function setup() {
            var _this = this;

            // TODO: ghost promise! is there a method like Q() in node promises?
            return new Promise(function (resolve, reject) {
                try {
                    _this.registerComponents(_this.nodes);
                    resolve(_this);
                } catch (e) {
                    reject(e);
                }
            });
        }
    }]);

    return ComponentRegistry;
}();

exports.ComponentRegistry = ComponentRegistry;