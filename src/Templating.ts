"use strict";

import {ComponentFile} from './ComponentFile';
import * as path from 'path';

export class Partial extends ComponentFile {
  public name: string;

  constructor(filePath: string) {
    // TODO: make template extension configurable
    super(filePath, path.basename(filePath, '_partial.hbs'));
    console.log("partial:", this.name);
  }
}

export class View extends ComponentFile {
  public name: string;
  public template: HandlebarsTemplateDelegate;

  constructor(filePath: string) {
    super(filePath, path.basename(filePath, '_view.hbs'));
  }

  // changing return type, because View has additional properties
  load():Promise<View> { return super.load(); }
}
