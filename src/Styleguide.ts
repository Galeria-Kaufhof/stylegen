import {ProjectConfig} from './Config';

export class Styleguide {
  config: ProjectConfig;

  constructor() {
    this.config = new ProjectConfig().load({});
    console.log(this.config);
  }

  read() {

  }

  write() {

  }
}
