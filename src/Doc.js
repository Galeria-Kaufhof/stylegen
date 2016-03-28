'use strict'

import { CompilableContent } from './CompilableContent'
import { error } from './Logger'


/**
 * Doc wraps up all occurances of markdown documents inside the styleguide.
 */
export class Doc extends CompilableContent {
  load() {
    return super.load()
    .then((doc) => {
      this.compiled = this.render()
      return doc
    })
    .catch(e => {
      error('Doc.load', e)
      throw (e)
    })
  }

  static create(path, name) {
    let doc = new Doc(path, name)
    doc.renderer = this.renderer
    return doc
  }
}
