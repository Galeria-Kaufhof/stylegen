"use strict";

import {Partial,Template,View} from './Templating';
import {Component} from './Component';

/**
 * Interface that new Renderers should implement.
 * As an example implementation look for the HandlebarsRenderer.
 */
export interface IRenderer {
  setEngine<T>(engine: T): IRenderer;
  render(component: Component): Component;
}

/** config for the renderer object */
export interface IRendererOptions {
  namespace?: string;
}

/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class HandlebarsRenderer implements IRenderer {
  private engine: any;

  constructor(private options?: IRendererOptions) {
  }

  private registerPartial(partial: Partial, namespace?: string):void {
    namespace = namespace || this.options.namespace;
    var partialName = `${namespace}.${partial.name}`;
    partial.compiled = this.engine.precompile(partial.raw);
    this.engine.registerPartial(partialName, partial.raw);
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
      component.partials.forEach((partial, namespace) => {
        this.registerPartial(partial);
      });
    }

    if (!!component.view) {
      component.view.template = this.compileView(component.view);
    }

    return component;
  }
}
