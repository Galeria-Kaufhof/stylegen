"use strict";

import {IRenderer, IRendererOptions} from './Renderer';
import {Doc} from './Doc';

import * as Remarkable from 'remarkable';
import {RemarkableUpfront} from './lib/RemarkableUpfront';
var md = new Remarkable({ quotes: ''});


/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class MarkdownRenderer implements IRenderer {
  public engine: any;

  constructor(private options?: IRendererOptions) {
    if (!!options && !!options.htmlEngine) {
      md.use(RemarkableUpfront(options.htmlEngine.engine));
    }
  }

  public render(raw: string):string {
    return md.render(raw);
  }
}
