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

  all(ids?: string[]):Component[] {
    if (!!ids && ids.length > 0) {
      return ids.map(id => this.find(id));
    }

    return this.keys().map(key => this.find(key)).filter(x => !!x);
  }
}
