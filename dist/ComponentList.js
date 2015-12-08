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
        if (!!ids && ids.length > 0) {
            return ids.map(id => this.find(id));
        }
        return this.keys().map(key => this.find(key)).filter(x => !!x);
    }
}
exports.ComponentList = ComponentList;
