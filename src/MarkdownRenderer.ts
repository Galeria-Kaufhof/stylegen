"use strict";

import {IRenderer, IRendererOptions} from './Renderer';

import * as Remarkable from 'remarkable';

import {RemarkableStylegen} from './lib/RemarkableStylegen';
import {StylegenPageLinks} from './lib/StylegenPageLinks';

var md = new Remarkable({ quotes: '', html: true });


/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class MarkdownRenderer implements IRenderer {
  public engine: any;

  constructor(private options?: IRendererOptions) {
    if (!!options && !!options.htmlEngine) {
      md.use(RemarkableStylegen(options.htmlEngine.engine));
    }

    if (!!options && !!options.htmlEngine && !!options.linkRegistry) {
      md.use(StylegenPageLinks(options.htmlEngine.engine, options.linkRegistry));
    }
  }

  public render(raw: string):string {
    return md.render(raw);
  }
}
