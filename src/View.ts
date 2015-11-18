"use strict";

import * as path from 'path';
import {CompilableContent, ICompilableContent} from './CompilableContent';

export class View extends CompilableContent {
  public name: string;
  public template: HandlebarsTemplateDelegate;

  constructor(filePath: string) {
    // TODO: remove fixed _view suffix
    super(filePath, path.basename(filePath, '_view.hbs'));
  }

  // changing return type, because View has additional properties
  load():Promise<View> {
    return super.load();
  }

  static create(filePath: string): ICompilableContent {
    var view:View = new View(filePath);
    view.engine = this.engine;
    return view;
  }
}
