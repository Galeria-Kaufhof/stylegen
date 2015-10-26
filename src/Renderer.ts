import {Partial,Template} from './Templating';

export interface IEngineWrapper {
  engine: any;
  setEngine<T>(engine: T): IEngineWrapper;
  registerPartial(partial: Partial): boolean;
  compileTemplate(template: Template): boolean;
}

export class HandlebarsRenderer implements IEngineWrapper {
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
