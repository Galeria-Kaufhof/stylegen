"use strict";

import {Component} from './Component';
import {warn} from './Logger';

/**
 * The ComponentList lets us build a registry, where we  may have a view
 * options to aggregate and find components.
 *
 * So we have implemented the classical find and all accessors,
 * to a possible list.
 */
export class ComponentList {
  private components: {[s: string]:Component }

  constructor() {
    this.components = {};
  }

  find(name: string):Component {
    let component = this.components[name];

    if (!component) {
      warn("ComponentList.find", `The component "${name}" could not be found.`, "Maybe it is not defined yet?!")
    }

    return component;
  }

  set(name: string, component: Component):void {
    this.components[name] = component;
  }

  keys():string[] {
    return Object.keys(this.components);
  }

  all(ids?: string[]):Component[] {
    if (!!ids && ids.length > 0) {
      return ids.map(id => this.find(id));
    }

    return this.keys().map(key => this.find(key)).filter(x => !!x);
  }
}
