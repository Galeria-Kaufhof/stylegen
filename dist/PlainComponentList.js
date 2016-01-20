"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var denodeify = require('denodeify');
var fs = require('fs-extra');
var Logger_1 = require('./Logger');
var fsoutputfile = denodeify(fs.outputFile);
/**
 * describes an app.component that has been wrapped in the component view,
 * and holds a reference to the Component itself and the compiled output.
 */

var PlainComponentList = function () {
    function PlainComponentList(styleguide) {
        _classCallCheck(this, PlainComponentList);

        this.styleguide = styleguide;
    }

    _createClass(PlainComponentList, [{
        key: 'buildStateContext',
        value: function buildStateContext(component, state, baseContext) {
            var stateContent = [];
            state.context = [].concat(state.context);
            stateContent = state.context.map(function (context) {
                var stateContext = Object.assign({}, baseContext, context);
                return component.view.template(stateContext);
            });
            return { label: state.label, slug: state.slug, doc: state.doc && state.doc.compiled, content: stateContent };
        }
        /**
         * view component building is the process of wrapping
         * a component inside the styleguides component view,
         * so that we may render it inside a component listing,
         * with the meta information etc. displayed as well,
         * as the compiled component view itself.
         */

    }, {
        key: 'buildViewComponent',
        value: function buildViewComponent(component) {
            var _this = this;

            var viewComponent = {
                component: component
            };
            /**
             * If the component has a view, we will render it to the list of components.
             * In case it has no view, we will not display the component for now.
             */
            if (!!component.view && !!component.view.template) {
                var viewContext = component.config.viewContext || {};
                var viewConfig = component.view.config || {};
                var viewBaseContext = Object.assign({}, viewConfig, viewContext);
                try {
                    /** build the render context for the current component */
                    var context = {
                        id: component.slug,
                        headline: component.config.label || component.id,
                        template: component.view.template(viewBaseContext),
                        docs: component.docs.map(function (d) {
                            return { "label": d.name, "content": d.compiled };
                        }),
                        component: component
                    };
                } catch (e) {
                    Logger_1.error("PlainComponentList.buildViewComponent", component.view.filePath);
                    Logger_1.error(e);
                    Logger_1.error(e.stack);
                    throw e;
                }
                if (!!component.config.states) {
                    context.states = component.states.map(function (state) {
                        return _this.buildStateContext(component, state, viewBaseContext);
                    });
                }
                /** lookup the styleguide component template */
                // TODO: handle/secure this law of demeter disaster :D
                var compTemplate = this.styleguide.components.find('sg.component').view.template;
                /** build the representation of the current component for the styleguide */
                viewComponent.compiled = compTemplate(context);
                return viewComponent;
            } else {
                return null;
            }
        }
    }, {
        key: 'intersect',
        value: function intersect(array1, array2) {
            if (!array1 || !array2) {
                return [];
            }
            return array1.filter(function (a) {
                return array2.indexOf(a) != -1;
            });
        }
    }, {
        key: 'build',
        value: function build(config) {
            var _this2 = this;

            config = config || {};
            return new Promise(function (resolve, reject) {
                var context = Object.assign({}, config);
                try {
                    /** get all all components, registered in the styleguide */
                    var components = _this2.styleguide.components.all(config && config.components);
                    if (!!config.tags) {
                        components = components.filter(function (c) {
                            return _this2.intersect(c.tags, config.tags).length == config.tags.length;
                        });
                    }
                    var componentViews = components.filter(function (c) {
                        return c && c.config && c.config.namespace === _this2.styleguide.config.namespace;
                    }).map(function (c) {
                        return _this2.buildViewComponent(c);
                    }).filter(function (c) {
                        return c !== null;
                    });
                    /** set context for rendering the component list */
                    context.components = componentViews;
                } catch (e) {
                    /** if some of the above fails, go to hell!! :) */
                    return reject(e);
                }
                // TODO: handle/secure this law of demeter disaster :D
                var compListTemplate = _this2.styleguide.components.find('sg.plain-list-layout').view.template;
                /** shorthand to the styleguide config */
                _this2.compiled = compListTemplate(context);
                return resolve(_this2);
            });
        }
        /**
         * the most basic writer, that handles the resolution of how to
         * integrated the rendered component views in the target file structure.
         */

    }, {
        key: 'write',
        value: function write(layoutContext) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                var config = _this3.styleguide.config;
                var layout = _this3.styleguide.components.find('sg.layout').view.template;
                layoutContext = Object.assign({}, layoutContext, { content: _this3.compiled });
                return fsoutputfile(path.resolve(config.cwd, config.target, "components.html"), layout(layoutContext)).then(function () {
                    return resolve(_this3);
                }).catch(function (e) {
                    return reject(e);
                });
            });
        }
    }]);

    return PlainComponentList;
}();

exports.PlainComponentList = PlainComponentList;