import templating = require('./templating');

interface EngineWrapper {
  engine: any;
  registerPartial(partial: templating.Partial): boolean;
  compileTemplate(template: templating.Template): boolean;
}

export class Renderer implements EngineWrapper {
  constructor(public engine:any) {

  }

  registerPartial(partial: templating.Partial) {
    return true;
  }

  compileTemplate(partial: templating.Template) {
    return true;
  }
}
