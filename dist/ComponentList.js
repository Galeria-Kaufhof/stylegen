"use strict";
var Logger_1 = require('./Logger');
class ComponentList {
    constructor() {
        this.components = {};
    }
    find(name) {
        let component = this.components[name];
        if (!component) {
            Logger_1.warn("ComponentList.find", `The component "${name}" could not be found.`, "Maybe it is not defined yet?!");
        }
        return component;
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
