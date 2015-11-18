"use strict";

import * as Handlebars from 'handlebars';

import {IRenderer, IRendererOptions} from './Renderer';
import {Partial} from './Partial';
import {View} from './View';
import {Component} from './Component';
import {Doc} from './Doc';

Handlebars.registerHelper("pp", function(object:{}){
  return new Handlebars.SafeString(JSON.stringify(object));
});

/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class HandlebarsRenderer implements IRenderer {
  public engine: any;

  constructor(private options?: IRendererOptions) {
    this.engine = Handlebars;
  }

  public render(component: Component):Component {
    // NOTHING TO DO HERE?!
    return component;
  }

}
