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
    all() {
        return this.keys().map(key => this.find(key));
    }
}
exports.ComponentList = ComponentList;
