"use strict";

import {IRenderer, IRendererOptions} from './Renderer';
import {Doc} from './Doc';

import * as Remarkable from 'remarkable';
import {RemarkableUpfront} from './lib/RemarkableUpfront';
var md = new Remarkable();

/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class MarkdownRenderer implements IRenderer {
  private engine: any;
  private htmlEngine: any;

  constructor(private options?: IRendererOptions) {
    if (!!options && !!options.htmlEngine) {
      this.htmlEngine = options.htmlEngine;

      md.use(RemarkableUpfront(this.htmlEngine));
    }
  }

  public setEngine<Object>(engine: Object) {
    this.engine = engine;
    return this;
  }

  public render(doc: Doc):Doc {
    doc.compiled = md.render(doc.raw);
    return doc;
  }
}
