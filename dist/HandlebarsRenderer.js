"use strict";
var Handlebars = require('handlebars');
var btoa = require('btoa');
Handlebars.registerHelper("pp", function (object) {
    return new Handlebars.SafeString(JSON.stringify(object));
});
/**
 * Build in renderer, that is taken as default if no external is given.
 */
class HandlebarsRenderer {
    constructor(options) {
        this.options = options;
        this.engine = Handlebars;
    }
    render(component) {
        // NOTHING TO DO HERE?!
        return component;
    }
    registerablePartial(name, content) {
        return `engine.registerPartial("${name}", atob('${btoa(content.trim())}'));`;
    }
}
exports.HandlebarsRenderer = HandlebarsRenderer;
