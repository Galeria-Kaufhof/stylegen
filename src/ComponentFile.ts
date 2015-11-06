"use strict";

import * as fs from 'fs';
import * as denodeify from 'denodeify';

var fsreadfile = denodeify(fs.readFile);

export interface IComponentFile {
  raw: string;
  name: string;

  load():Promise<IComponentFile>;
}

export class ComponentFile {
  raw: string;

  constructor(private filePath: string, public name: string) {}

  load():Promise<IComponentFile> {
    return fsreadfile(this.filePath.toString())
    .then((buffer) => {
      var content:string = buffer.toString();
      this.raw = content;
      return this;
    });
  }
}
