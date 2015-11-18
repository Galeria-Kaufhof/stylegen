"use strict";

import {CompilableContent, ICompilableContent} from './CompilableContent';

import * as path from 'path';

export class Partial extends CompilableContent {
  public name: string;

  constructor(filePath: string) {
    // TODO: make template extension configurable
    super(filePath, path.basename(filePath, '_partial.hbs'));
  }

  static create(filePath: string): ICompilableContent {
    var partial:Partial = new Partial(filePath);
    partial.engine = this.engine;
    return partial;
  }
}
