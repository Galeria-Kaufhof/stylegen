"use strict";

import {ComponentFile} from './ComponentFile';
import * as path from 'path';

export class Partial extends ComponentFile {
  public name: string;

  constructor(filePath: string) {
    super(filePath);

    // TODO: make template extension configurable
    this.name = path.basename(filePath, '_partial.hbs');
  }
}

export class View extends ComponentFile {
  public name: string;
  public template: HandlebarsTemplateDelegate;

  constructor(filePath: string) {
    super(filePath);

    // TODO: make template extension configurable
    this.name = path.basename(filePath, '_partial.hbs');
  }
}
