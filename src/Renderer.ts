import {Partial,Template} from './Templating';

/**
 * Interface that new Renderers should implement.
 * As an example implementation look for the HandlebarsRenderer.
 */
export interface IRenderer {
  engine: any;
  setEngine<T>(engine: T): IRenderer;
  registerPartial(partial: Partial): boolean;
  compileTemplate(template: Template): boolean;
}

/**
 * Build in renderer, that is taken as default if no external is given.
 */
export class HandlebarsRenderer implements IRenderer {
  engine: any;

  setEngine<Handlebars>(engine: Handlebars) {
    this.engine = engine;
    return this;
  }

  registerPartial(partial: Partial) {
    return true;
  }

  compileTemplate(partial: Template) {
    return true;
  }
}
