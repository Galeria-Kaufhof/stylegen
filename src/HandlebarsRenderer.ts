"use strict";

import {IRenderer, IRendererOptions} from './Renderer';
import {Partial,View} from './Templating';
import {Component} from './Component';
import {Doc} from './Doc';

// TODO: move this and HB rendering to Component Renderer
import {MarkdownRenderer} from './MarkdownRenderer';

/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class HandlebarsRenderer implements IRenderer {
  public engine: any;

  constructor(private options?: IRendererOptions) {
  }

  private registerPartial(partial: Partial, namespace?: string):void {
    namespace = namespace || this.options.namespace;
    var partialName = `${namespace}.${partial.name}`;
    partial.compiled = this.engine.precompile(partial.raw);
    this.engine.registerPartial(partialName, partial.raw);
  }

  private compileDoc(doc: Doc):Doc {
    // TODO: Move this to a more generic ComponentRenderer
    // TODO: don't initialize for each doc!
    return new MarkdownRenderer({"htmlEngine": this.engine}).render(doc);
  }

  private compileView(view: View):HandlebarsTemplateDelegate {
    return this.engine.compile(view.raw);
  }

  public setEngine<Handlebars>(engine: Handlebars) {
    this.engine = engine;
    return this;
  }

  public render(component: Component):Component {
    var namespace:string;
    component = Object.assign({}, component);

    if (component.config.namespace) {
      namespace = component.config.namespace;
    }

    if (!!component.partials) {
      for (let partial of component.partials) {
        this.registerPartial(partial, namespace);
      });
    }

    if (!!component.view) {
      component.view.template = this.compileView(component.view);
    }

    // TODO: see TODO in imports about ComponentRenderer
    if (!!component.docs) {
      component.docs = component.docs.map(doc => this.compileDoc(doc));
    }

    return component;
  }
}
