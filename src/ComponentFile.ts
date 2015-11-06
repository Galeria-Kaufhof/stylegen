"use strict";

import * as fs from 'fs';
import * as denodeify from 'denodeify';

var fsreadfile = denodeify(fs.readFile);


interface IComponentFile {
  raw: string;

  load():Promise<IComponentFile>;
}

export class ComponentFile implements IComponentFile {
  raw: string;

  constructor(private filePath: string) {}

  load():Promise<IComponentFile> {
    return fsreadfile(this.filePath.toString())
    .then((buffer) => {
      var content:string = buffer.toString();
      this.raw = content;
      return this;
    });
  }
}
