"use strict";

import {IRenderer, IRendererOptions} from './Renderer';

import * as Remarkable from 'remarkable';
import {RemarkableStylegen} from './lib/RemarkableStylegen';
var md = new Remarkable({ quotes: '' });


/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class MarkdownRenderer implements IRenderer {
  public engine: any;

  constructor(private options?: IRendererOptions) {
    if (!!options && !!options.htmlEngine) {
      md.use(RemarkableStylegen(options.htmlEngine.engine));
    }
  }

  public render(raw: string):string {
    return md.render(raw);
  }
}
