"use strict";

import * as path from 'path';
import * as fs from 'fs';
import * as denodeify from 'denodeify';

var fsreadfile = denodeify(fs.readFile);

export interface Template {
  name:string;
  filePath: string;
  raw: string;

  load():Promise<Template>;
}

export class Partial implements Template {
  raw: string;
  compiled: string;
  name: string;

  constructor(public filePath: string) {
    // TODO: make template extension configurable
    this.name = path.basename(filePath, '_partial.hbs');
  }

  load():Promise<Partial> {
    return fsreadfile(this.filePath.toString())
    .then((buffer) => {
      var content:string = buffer.toString();
      this.raw = content;
      return this;
    });
  }
}

export class View implements Template {
  raw: string;
  template: HandlebarsTemplateDelegate;
  name: string;

  constructor(public filePath: string) {
    this.name = path.basename(filePath);
  }

  load():Promise<View> {
    return fsreadfile(this.filePath.toString())
    .then((fileBuffer) => {
      var content:string = fileBuffer.toString();
      this.raw = content;
      return this;
    });
  }
}
