"use strict";

import {CompilableContent} from './CompilableContent';
import {MarkdownRenderer} from './MarkdownRenderer';
import {ICompilableContent} from './CompilableContent';
import {IRenderer} from './Renderer';

export class Doc extends CompilableContent {
  private static engine: IRenderer;

  render():string {
    return this.engine.render(this.raw);
  }

  static setEngine(engine: IRenderer) {
    this.engine = engine;
  }

  static create(path: string, name: string): ICompilableContent {
    var doc:Doc = new Doc(path, name);
    doc.engine = this.engine;
    return doc;
  }
}
