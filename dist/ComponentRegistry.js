"use strict";
class ComponentRegistry {
    // this.styleguide = styleguide;
    constructor(renderer, nodes) {
        this.nodes = nodes;
        this.renderer = renderer;
        // this.styleguide = styleguide;
    }
    /**
     * to have the components ready to be build,
     * we have to announce them to the renderer, so that the resolution
     * of partials, etc. works as expected.
     */
    registerComponents(nodes) {
        for (let node of nodes) {
            if (node.isComponent()) {
            }
            /** run through the node tree and register childrens, and childrens childrent, and ... */
            if (!!node.children) {
                this.registerComponents(node.children);
            }
        }
    }
    /**
     * before we start to write the styleguide components, we will do the necessary setup tasks,
     * like renderer setup and anything else, that has to be done in beforehand.
     */
    setup() {
        // TODO: ghost promise! is there a method like Q() in node promises?
        return new Promise((resolve, reject) => {
            try {
                this.registerComponents(this.nodes);
                resolve(this);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.ComponentRegistry = ComponentRegistry;
