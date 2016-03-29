'use strict'

import path from 'path'
import fs from 'fs-extra'
import denodeify from 'denodeify'
import { CompilableContent } from './CompilableContent'

let fsreadfile = denodeify(fs.readFile)

export class Partial extends CompilableContent {
  constructor(filePath, namespace) {
    // TODO: make template extension configurable
    super(filePath, path.basename(filePath, '_partial.hbs'))
    this.namespace = namespace
  }

  load() {
    return fsreadfile(this.filePath.toString())
      .then((buffer) => {
        let content = buffer.toString()
        this.raw = content
        let partialName = `${this.namespace}.${this.name}`
        this.compiled = this.renderer.engine.precompile(this.raw)
        this.renderer.engine.registerPartial(partialName, this.raw)
        let renderer = this.renderer
        this.registerable = renderer.registerablePartial(partialName, this.raw)
        return this
      })
  }

  static create(filePath, namespace) {
    let partial = new Partial(filePath, namespace)
    partial.renderer = this.renderer
    return partial
  }
}
