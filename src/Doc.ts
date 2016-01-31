"use strict";

import * as fs from 'fs-extra';
import * as denodeify from 'denodeify';

import {CompilableContent, ICompilableContent} from './CompilableContent';
import {error} from './Logger';

var fsreadfile = denodeify(fs.readFile);

/**
 * Doc wraps up all occurances of markdown documents inside the styleguide.
 */
export class Doc extends CompilableContent {
  load():Promise<ICompilableContent> {
    return super.load()
    .then((doc) => {
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
