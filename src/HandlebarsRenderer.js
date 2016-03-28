"use strict";
import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as url from 'url';
import * as btoa from 'btoa';
import * as atob from 'atob';
import * as pretty from 'pretty';
Handlebars.registerHelper("pp", function (object) {
    return new Handlebars.SafeString(JSON.stringify(object));
});
Handlebars.registerHelper("beautified", function (object) {
    return pretty(object);
});
Handlebars.registerHelper("eq", function (a, b) {
    return a === b;
});
Handlebars.registerHelper("rellink", function (link, options) {
    var absoluteLinkPath = link;
    var uri = url.parse(link);
    var options = options.data.root, cwd, root;
    if (uri.host !== null) {
        // we have an URL here, not a path, so just return it
        return link;
    }
    if (!options.cwd || !options.root) {
        // we don't have enough information to resolve the path to current location
        return link;
    }
    try {
        if (link && link[0] !== '/') {
            absoluteLinkPath = path.resolve(options.root, link);
        }
        return path.relative(options.cwd, absoluteLinkPath);
    }
    catch (e) {
        console.log(e);
        return link;
    }
});
/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class HandlebarsRenderer {
    constructor(options) {
        this.options = options;
        this.engine = Handlebars;
        if (!!options && !!options.partialLibs) {
            this.partialLibs = options.partialLibs;
            this.partialLibs.forEach(lib => lib.partials(this.engine, atob));
        }
    }
    render(component) {
        // NOTHING TO DO HERE?!
        return component;
    }
    registerablePartial(name, content) {
        return `engine.registerPartial("${name}", engine.compile(atob('${btoa(content.trim())}')));`;
    }
}
