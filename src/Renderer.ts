import {Partial,Template} from './Templating';

interface EngineWrapper {
  engine: any;
  registerPartial(partial: Partial): boolean;
  compileTemplate(template: Template): boolean;
}

export class Renderer implements EngineWrapper {
  constructor(public engine:any) {

  }

  registerPartial(partial: Partial) {
    return true;
  }

  compileTemplate(partial: Template) {
    return true;
  }
}
