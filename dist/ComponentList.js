"use strict";
class ComponentList {
    constructor() {
        this.components = {};
    }
    find(name) {
        return this.components[name];
    }
    set(name, component) {
        this.components[name] = component;
    }
    keys() {
        return Object.keys(this.components);
    }
    all(ids) {
        var components = this.keys().map(key => this.find(key));
        if (!!ids && ids.length > 0) {
            components = components.filter(c => ids.includes(c.id));
            console.log("found comps", components.length);
        }
        return components;
    }
}
exports.ComponentList = ComponentList;
