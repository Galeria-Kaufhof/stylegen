"use strict";

import {CompilableContent, ICompilableContent} from './CompilableContent';
import {MarkdownRenderer} from './MarkdownRenderer';
import {IRenderer} from './Renderer';

export class Doc extends CompilableContent {
  static create(path: string, name: string): ICompilableContent {
    var doc:Doc = new Doc(path, name);
    doc.engine = this.engine;
    return doc;
  }
}
