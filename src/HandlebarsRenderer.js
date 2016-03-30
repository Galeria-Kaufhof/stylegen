'use strict'

import Handlebars from 'handlebars'
import path from 'path'
import url from 'url'
import btoa from 'btoa'
import atob from 'atob'
import pretty from 'pretty'

Handlebars.registerHelper('pp', (object) => {
  return new Handlebars.SafeString(JSON.stringify(object))
})

Handlebars.registerHelper('beautified', (object) => {
  return pretty(object)
})

Handlebars.registerHelper('eq', function (a, b) {
  return a === b
})

Handlebars.registerHelper('rellink', function (link, options) {
  let absoluteLinkPath = link
  let uri = url.parse(link)
  options = options.data.root

  if (uri.host !== null) {
    // we have an URL here, not a path, so just return it
    return link
  }

  if (!options.cwd || !options.root) {
    // we don't have enough information to resolve the path to current location
    return link
  }

  try {
    if (link && link[0] !== '/') {
      absoluteLinkPath = path.resolve(options.root, link)
    }

    return path.relative(options.cwd, absoluteLinkPath)
  } catch (e) {
    // console.log(e)
    return link
  }
})
/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class HandlebarsRenderer {
  constructor(options) {
    this.options = options
    this.engine = Handlebars

    if (!!options && !!options.partialLibs) {
      this.partialLibs = options.partialLibs
      this.partialLibs.forEach(lib => lib.partials(this.engine, atob))
    }
  }

  render(component) {
    // NOTHING TO DO HERE?!
    return component
  }

  registerablePartial(name, content) {
    return `engine.registerPartial("${name}", engine.compile(atob('${btoa(content.trim())}')))`
  }
}
