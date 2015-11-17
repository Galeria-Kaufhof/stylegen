"use strict";

import * as fs from 'fs';
import * as denodeify from 'denodeify';

var fsreadfile = denodeify(fs.readFile);

export interface IRenderContent {
  raw: string;
  name: string;
  compiled: string;

  load():Promise<IRenderContent>;
}

export class RenderContent implements IRenderContent {
  raw: string;
  compiled: string;

  constructor(private filePath: string, public name: string) {}

  load():Promise<IRenderContent> {
    return fsreadfile(this.filePath.toString())
    .then((buffer) => {
      var content:string = buffer.toString();
      this.raw = content;
      return this;
    });
  }
}
