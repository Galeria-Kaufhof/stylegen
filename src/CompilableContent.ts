"use strict";

import * as fs from 'fs-extra';
import * as denodeify from 'denodeify';

import {IRenderer} from './Renderer';
import {error} from './Logger';

/** promisified readfile callback */
var fsreadfile = denodeify(fs.readFile);


/**
 * the spirit of the CompilableContent class,
 * which delivers a default implementation for loading the file content.
 * How the compiled content is generated is mostly up to the class
 * that inherits from CompilableContent.
 */
export interface ICompilableContent {
  raw: string;
  name: string;
  compiled: string;
  renderer: IRenderer;

  load():Promise<ICompilableContent>;
}


/**
 * CompilableContent builds the abstract wrapper for compilable files,
 * like markdown documents, handlebars views and partials.
 */
export class CompilableContent implements ICompilableContent {
  public static renderer: IRenderer;

  public renderer: IRenderer;
  public raw: string;
  public compiled: string;

  static setRenderer(renderer: IRenderer) {
    this.renderer = renderer;
  }
  constructor(public filePath: string, public name: string) {}

  load():Promise<ICompilableContent> {
    return fsreadfile(this.filePath.toString())
    .then((buffer) => {
      var content:string = buffer.toString();
      this.raw = content;
      return this;
    });
  }

  render():string {
    try {
      return this.renderer.render(this.raw);
    } catch(e) {
      error("CompilableContent.render:", e);
      console.log(e.stack);
      throw(e);
    }
  }
}
