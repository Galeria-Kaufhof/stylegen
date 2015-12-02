"use strict";

import {Component} from './Component';

export class ComponentList {
  private components: {[s: string]:Component }

  constructor() {
    this.components = {};
  }

  find(name: string):Component {
    return this.components[name];
  }

  set(name: string, component: Component):void {
    this.components[name] = component;
  }

  keys():string[] {
    return Object.keys(this.components);
  }

  all(ids: string[]):Component[] {
    var components this.keys().map(key => this.find(key));

    if (!!ids && ids.length > 0) {
      components = components.filter(c => ids.includes(c.id));
      console.log("found comps", components.length)
    }

    return components;
  }
}
