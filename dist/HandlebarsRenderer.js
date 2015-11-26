"use strict";
var Handlebars = require('handlebars');
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
}
exports.HandlebarsRenderer = HandlebarsRenderer;
