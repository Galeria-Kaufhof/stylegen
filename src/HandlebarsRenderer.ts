"use strict";

import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as btoa from 'btoa';


import * as atob from 'atob';

import {IRenderer, IRendererOptions} from './Renderer';
import {Component} from './Component';

Handlebars.registerHelper("pp", function(object:{}){
  return new Handlebars.SafeString(JSON.stringify(object));
});

// require(path.resolve('.', 'partials.js')).partials(Handlebars, atob);

export interface ITemplateRenderer {
  registerablePartial(name: string, content: string): string;
}

/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class HandlebarsRenderer implements IRenderer, ITemplateRenderer {
  public engine: any;

  constructor(private options?: IRendererOptions) {
    this.engine = Handlebars;
  }

  public render(component: Component):Component {
    // NOTHING TO DO HERE?!
    return component;
  }

  public registerablePartial(name: string, content: string):string {
    return `engine.registerPartial("${name}", atob('${btoa(content.trim())}'));`;
  }
}
