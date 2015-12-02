"use strict";

import * as path from 'path';
import * as fs from 'fs-extra';
import * as denodeify from 'denodeify';

import {CompilableContent, ICompilableContent} from './CompilableContent';

var fsreadfile = denodeify(fs.readFile);


export class Partial extends CompilableContent {
  public name: string;
  public registerable: string;

  constructor(filePath: string, private namespace: string) {
    // TODO: make template extension configurable
    super(filePath, path.basename(filePath, '_partial.hbs'));
  }

  load():Promise<ICompilableContent> {
    return fsreadfile(this.filePath.toString())
    .then((buffer) => {
      var content:string = buffer.toString();
      this.raw = content;

      var partialName = `${this.namespace}.${this.name}`;
      this.compiled = this.renderer.engine.precompile(this.raw);
      this.renderer.engine.registerPartial(partialName, this.raw);

      var renderer:any = this.renderer;
      this.registerable = renderer.registerablePartial(partialName, this.raw);

      return this;
    });
  }

  static create(filePath: string, namespace: string): ICompilableContent {
    var partial:Partial = new Partial(filePath, namespace);
    partial.renderer = this.renderer;
    return partial;
  }
}
