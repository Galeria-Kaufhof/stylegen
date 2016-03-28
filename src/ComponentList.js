'use strict'
import { warn } from './Logger'

/**
 * The ComponentList lets us build a registry, where we  may have a view
 * options to aggregate and find components.
 *
 * So we have implemented the classical find and all accessors,
 * to a possible list.
 */
export class ComponentList {
  constructor() {
    this.components = {}
  }

  find(name) {
    let component = this.components[name]
    if (!component) {
      warn('ComponentList.find', `The component "${name}" could not be found.`, 'Maybe it is not defined yet?!')
    }

    return component
  }

  set(name, component) {
    this.components[name] = component
  }

  keys() {
    return Object.keys(this.components)
  }

  all(ids) {
    if (!!ids && ids.length > 0) {
      return ids.map(id => this.find(id))
    }

    return this.keys().map(key => this.find(key)).filter(x => !!x)
  }
}
