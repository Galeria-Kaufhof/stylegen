'use strict'

import * as path from 'path'
import * as fm from 'front-matter'
import { CompilableContent } from './CompilableContent'

export class View extends CompilableContent {
  constructor(filePath) {
    // TODO: remove fixed _view suffix
    super(filePath, path.basename(filePath, '(_view)?.hbs'))
  }

  load() {
    return super.load()
      .then(() => {
        let content = fm(this.raw)

        if (Object.keys(content.attributes).length) {
          this.config = content.attributes
        }

        this.template = this.renderer.engine.compile(content.body)
        return this
      })
  }

  static create(filePath) {
    let view = new View(filePath)
    view.renderer = this.renderer
    return view
  }
}
