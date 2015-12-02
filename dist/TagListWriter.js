"use strict";
var path = require('path');
var fs = require('fs-extra');
var denodeify = require('denodeify');
var fsoutputfile = denodeify(fs.outputFile);
class TagListWriter {
    constructor(styleguide) {
        this.styleguide = styleguide;
    }
    /**
     * view component building is the process of wrapping
     * a component inside the styleguides component view,
     * so that we may render it inside a component listing,
     * with the meta information etc. displayed as well,
     * as the compiled component view itself.
     */
    buildViewComponent(component) {
        var viewComponent = {
            component: component
        };
        /**
         * If the component has a view, we will render it to the list of components.
         * In case it has no view, we will not display the component for now.
         */
        if (!!component.view && !!component.view.template) {
            /** build the render context for the current component */
            var context = {
                id: component.slug,
                headline: component.config.label || component.id,
                // TODO: insert component.context as context
                template: component.view.template({}),
                docs: component.docs.map(d => {
                    return { "label": d.name, "content": d.compiled };
                }),
                component: component
            };
            /** lookup the styleguide component template */
            // TODO: handle/secure this law of demeter disaster :D
            var compTemplate = this.styleguide.components.find('sg.component').view.template;
            /** build the representation of the current component for the styleguide */
            viewComponent.compiled = compTemplate(context);
            return viewComponent;
        }
        else {
            return null;
        }
    }
    /**
     * the most basic writer, that handles the resolution of how to
     * integrated the rendered component views in the target file structure.
     */
    write(layoutContext) {
        return new Promise((resolve, reject) => {
            var context = layoutContext || {};
            try {
                /** get all all components, registered in the styleguide */
                var components = this.styleguide.components.all()
                    .map(component => this.buildViewComponent(component));
                /** remove components that had no view */
                // .filter(c => c !== null);
                /** set context for rendering the component list */
                context = { components: components };
            }
            catch (e) {
                /** if some of the above fails, go to hell!! :) */
                reject(e);
            }
            // TODO: handle/secure this law of demeter disaster :D
            var compListTemplate = this.styleguide.components.find('sg.plain-list-layout').view.template;
            /** shorthand to the styleguide config */
            var config = this.styleguide.config;
            fsoutputfile.apply(this, [path.resolve(config.cwd, config.target, "components.html"), compListTemplate(context)])
                .then(() => resolve(this))
                .catch((e) => reject(e));
        });
    }
}
exports.TagListWriter = TagListWriter;
