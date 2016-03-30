'use strict'

import { warn } from './Logger'

export class LinkRegistry {
  constructor() {
    this.links = {}
  }

  add(key, link, context) {
    this.links[key] = {
      link: link,
      context: context
    }
  }

  find(key) {
    try {
      return this.links[key]
    } catch (e) {
      warn('LinkRegistry.find', e.message)
      return null
    }
  }

  entries() {
    return Object.keys(this.links)
  }
}
