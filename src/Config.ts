interface AbstractConfig {
  config: Object;
  load(path: string):AbstractConfig;
}

export class ProjectConfig implements AbstractConfig {
  config: Object;

  load(path: string) {
    this.config = {};
    return this;
  }
}
