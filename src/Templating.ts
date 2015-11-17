"use strict";

import {CompilableContent} from './CompilableContent';
import * as path from 'path';

export class Partial extends CompilableContent {
  public name: string;

  constructor(filePath: string) {
    // TODO: make template extension configurable
    super(filePath, path.basename(filePath, '_partial.hbs'));
  }
}

export class View extends CompilableContent {
  public name: string;
  public template: HandlebarsTemplateDelegate;

  constructor(filePath: string) {
    super(filePath, path.basename(filePath, '_view.hbs'));
  }

  // changing return type, because View has additional properties
  load():Promise<View> { return super.load(); }
}
