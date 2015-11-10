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

  all():Component[] {
    return this.keys().map(key => this.styleguide.components.find(key));
  }
}
