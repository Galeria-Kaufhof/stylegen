"use strict";

import * as path from 'path';
import {CompilableContent, ICompilableContent} from './CompilableContent';
// fm = require('front-matter')
import * as fm from 'front-matter';

export class View extends CompilableContent {
  public name: string;
  public template: HandlebarsTemplateDelegate;
  public config: {};

  constructor(filePath: string) {
    // TODO: remove fixed _view suffix
    super(filePath, path.basename(filePath, '(_view)?.hbs'));
  }

  load():Promise<View> {
    return super.load()
    .then(view => {
      var content = fm(this.raw);

      if (Object.keys(content.attributes).length) {
        this.config = content.attributes;
      }

      this.template = this.renderer.engine.compile(content.body);
      return this;
    });
  }

  static create(filePath: string): View {
    var view:View = new View(filePath);
    view.renderer = this.renderer;
    return view;
  }
}
