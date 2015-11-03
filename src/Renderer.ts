"use strict";

import {Partial,Template,View} from './Templating';
import {Component} from './Component';
import {IRendererConfig} from './Config';

/**
 * Interface that new Renderers should implement.
 * As an example implementation look for the HandlebarsRenderer.
 */
export interface IRenderer {
  engine: any;
  config: IRendererConfig;
  setEngine<T>(engine: T): IRenderer;
  registerComponent(component: Component): void;
}

/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class HandlebarsRenderer implements IRenderer {
  engine: any;
  config: IRendererConfig;

  constructor(config?: IRendererConfig) {
    if (!!config) {
      this.config = config;
    }
  }

  private registerPartial(partial: Partial, namespace?: string):void {
    namespace = namespace || this.config.modulePrefix;
    var partialName = `${namespace}.${partial.name}`;
    partial.compiled = this.engine.precompile(partial.raw);
    this.engine.registerPartial(partialName, partial.raw);
  }

  private registerView(view: View):void {
    view.template = this.engine.compile(view.raw);
  }

  public setEngine<Handlebars>(engine: Handlebars) {
    this.engine = engine;
    return this;
  }

  public registerComponent(component: Component):void {
    var namespace:string;
    if (component.config.namespace) {
      namespace = component.config.namespace;
    }

    if (!!component.partials) {
      component.partials.forEach((partial, namespace) => {
        this.registerPartial(partial);
      });
    }

    if (!!component.view) {
      this.registerView(component.view);
    }
  }
}
