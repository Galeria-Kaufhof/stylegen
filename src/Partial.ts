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
