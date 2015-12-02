"use strict";

import * as fs from 'fs-extra';
import * as denodeify from 'denodeify';

import {CompilableContent, ICompilableContent} from './CompilableContent';
import {error} from './Logger';

var fsreadfile = denodeify(fs.readFile);

export class Doc extends CompilableContent {
  load():Promise<ICompilableContent> {
    return fsreadfile(this.filePath.toString())
    .then((buffer) => {
      var content:string = buffer.toString();
      this.raw = content;

      this.compiled = this.render();
      return this;
    })
    .catch(e => {
      error("Doc.load", e);
      console.log(e.stack);
      throw(e);
    });
  }

  static create(path: string, name: string): ICompilableContent {
    var doc:Doc = new Doc(path, name);
    doc.renderer = this.renderer;
    return doc;
  }
}
