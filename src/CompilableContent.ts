"use strict";

import * as fs from 'fs';
import * as denodeify from 'denodeify';

import {IRenderer} from './Renderer';

var fsreadfile = denodeify(fs.readFile);

export interface ICompilableContent {
  raw: string;
  name: string;
  compiled: string;
  engine: IRenderer;

  load():Promise<ICompilableContent>;
}

export class CompilableContent implements ICompilableContent {
  raw: string;
  compiled: string;
  engine: IRenderer;

  constructor(private filePath: string, public name: string) {}

  load():Promise<ICompilableContent> {
    return fsreadfile(this.filePath.toString())
    .then((buffer) => {
      var content:string = buffer.toString();
      this.raw = content;
      return this;
    });
  }
}
