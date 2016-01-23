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

Handlebars.registerHelper("eq", function(a: {}, b: {}){
  return a === b;
});

Handlebars.registerHelper("rellink", function(link, options){

  var absoluteLinkPath = link;
  var options =  options.data.root, cwd, root;
  // console.log(link)
  if (!options.cwd || !options.root) {
    return link;
  }

  try {
    if (link && link[0] !== '/') {
      absoluteLinkPath = path.resolve(options.root, link);
    }

    return path.relative(options.cwd, absoluteLinkPath);
  } catch(e) {
    console.log(e)
    return link;
  }
});


export interface ITemplateRenderer {
  partialLibs: any[];
  registerablePartial(name: string, content: string): string;
}

/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class HandlebarsRenderer implements IRenderer, ITemplateRenderer {
  public engine: any;
  public partialLibs: any[];

  constructor(private options?: IRendererOptions) {
    this.engine = Handlebars;

    if (!!options && !!options.partialLibs) {
      this.partialLibs = options.partialLibs

      this.partialLibs.forEach(lib => lib.partials(this.engine, atob))
    }
  }

  public render(component: Component):Component {
    // NOTHING TO DO HERE?!
    return component;
  }

  public registerablePartial(name: string, content: string):string {
    return `engine.registerPartial("${name}", engine.compile(atob('${btoa(content.trim())}')));`;
  }
}
