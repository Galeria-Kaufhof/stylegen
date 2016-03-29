'use strict'

import Remarkable from 'remarkable'
import { RemarkableStylegen } from './lib/RemarkableStylegen'
import { StylegenPageLinks } from './lib/StylegenPageLinks'

let md = new Remarkable({ quotes: '', html: true })

/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class MarkdownRenderer {
  constructor(options) {
    this.options = options

    if (!!options && !!options.htmlEngine) {
      md.use(RemarkableStylegen(options.htmlEngine.engine))
    }

    if (!!options && !!options.htmlEngine && !!options.linkRegistry) {
      md.use(StylegenPageLinks(options.htmlEngine.engine, options.linkRegistry))
    }
  }

  render(raw) {
    return md.render(raw)
  }
}
