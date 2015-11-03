"use strict";

import * as path from 'path';
import * as fs from 'fs';
import * as Q from 'q';

export interface Template {
  name:string;
  filePath: string;
  raw: string;

  load():Q.Promise<Template>;
}

export class Partial implements Template {
  raw: string;
  compiled: string;
  name: string;

  constructor(public filePath: string) {
    // TODO: make template extension configurable
    this.name = path.basename(filePath, '_partial.hbs');
  }

  load():Q.Promise<Partial> {
    return Q.nfcall(fs.readFile, this.filePath)
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

  load():Q.Promise<View> {
    return Q.nfcall(fs.readFile, this.filePath)
    .then((fileBuffer) => {
      var content:string = fileBuffer.toString();
      this.raw = content;
      return this;
    });
  }
}
