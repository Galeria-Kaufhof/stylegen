"use strict";

import {RenderContent} from './RenderContent';
import * as path from 'path';

export class Partial extends RenderContent {
  public name: string;

  constructor(filePath: string) {
    // TODO: make template extension configurable
    super(filePath, path.basename(filePath, '_partial.hbs'));
  }
}

export class View extends RenderContent {
  public name: string;
  public template: HandlebarsTemplateDelegate;

  constructor(filePath: string) {
    super(filePath, path.basename(filePath, '_view.hbs'));
  }

  // changing return type, because View has additional properties
  load():Promise<View> { return super.load(); }
}
