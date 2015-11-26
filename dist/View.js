"use strict";
var path = require('path');
var CompilableContent_1 = require('./CompilableContent');
class View extends CompilableContent_1.CompilableContent {
    constructor(filePath) {
        // TODO: remove fixed _view suffix
        super(filePath, path.basename(filePath, '_view.hbs'));
    }
    // changing return type, because View has additional properties
    load() {
        return super.load()
            .then(view => {
            this.template = this.renderer.engine.compile(this.raw);
            return this;
        });
    }
    static create(filePath) {
        var view = new View(filePath);
        view.renderer = this.renderer;
        return view;
    }
}
exports.View = View;
