"use strict";

import {CompilableContent} from './CompilableContent';
import * as path from 'path';

export class View extends CompilableContent {
  public name: string;
  public template: HandlebarsTemplateDelegate;

  constructor(filePath: string) {
    super(filePath, path.basename(filePath, '_view.hbs'));
  }

  // changing return type, because View has additional properties
  load():Promise<View> {
    return super.load();
  }

  // render():string {
  //   return this.engine.render(this.raw);
  // }
}
