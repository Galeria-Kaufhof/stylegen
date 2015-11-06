"use strict";

import {IRenderer, IRendererOptions} from './Renderer';
import {Doc} from './Doc';
import * as marked from 'marked';

/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class MarkdownRenderer implements IRenderer {
  private engine: any;

  constructor(private options?: IRendererOptions) {}

  public setEngine<Object>(engine: Object) {
    this.engine = engine;
    return this;
  }

  public render(doc: Doc):Doc {
    doc.compiled = marked(doc.raw);
    return doc;
  }
}
