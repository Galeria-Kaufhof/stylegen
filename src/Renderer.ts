import {Partial,Template,View} from './Templating';
import {Node} from './Node';
import {IRendererConfig} from './Config';

/**
 * Interface that new Renderers should implement.
 * As an example implementation look for the HandlebarsRenderer.
 */
export interface IRenderer {
  engine: any;
  config: IRendererConfig;
  setEngine<T>(engine: T): IRenderer;
  registerComponent(node: Node): void;
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

  setEngine<Handlebars>(engine: Handlebars) {
    this.engine = engine;
    return this;
  }

  private registerPartial(partial: Partial):void {
    var partialName = `${this.config.modulePrefix}.${partial.name}`;
    partial.compiled = this.engine.precompile(partial.raw);

    this.engine.registerPartial(partialName, partial.raw);
  }

  private registerView(view: View):void {
    // var viewName = `${this.config.modulePrefix}.${view.name}`;
    view.template = this.engine.compile(view.raw);
  }

  registerComponent(node: Node):void {
    if (node.isComponent()) {
      if (!!node.component.partials) {
        node.component.partials.forEach((partial) => {
          this.registerPartial(partial);
        });
      }

      if (!!node.component.view) {
        this.registerView(node.component.view);
      }
    }
  }
}
