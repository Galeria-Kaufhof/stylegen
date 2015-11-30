"use strict";
var Handlebars = require('handlebars');
var path = require('path');
var btoa = require('btoa');
var atob = require('atob');
Handlebars.registerHelper("pp", function (object) {
    return new Handlebars.SafeString(JSON.stringify(object));
});
require(path.resolve('.', 'partials.js')).partials(Handlebars, atob);
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
