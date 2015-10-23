import * as path from 'path';
import * as Q from 'q';
import {ProjectConfig} from './Config';
import {StructureBuilder} from './StructureBuilder';

export class Styleguide {
  config: ProjectConfig;

  // Styleguide setup method to collect and merge configurations,
  // to set defaults and allow to overwrite them in the styleguide.json
  initialize(cwd: string, upfrontRoot: string):Q.Promise<Styleguide> {
    var d:Q.Deferred<Styleguide> = Q.defer<Styleguide>();
    var self:Styleguide = this;

    new ProjectConfig()
    .load(path.resolve(cwd, 'styleguide.json'), path.resolve(upfrontRoot, 'defaults.json'))
    .then(function(mergedConfig: ProjectConfig) {
      self.config = mergedConfig;
      self.config["cwd"] = cwd;
      d.resolve(self);
    })
    .catch(function(e) {
      console.log("Styleguide.initialize:",e);
      throw(e);
    });

    return d.promise;
  }

  // walk the configured styleguide folders and read in the several components, pages, navigation, etc.,
  // and store the information inside the styleguide properties.
  read():Q.Promise<{}> {
    var d:Q.Deferred<{}> = Q.defer<{}>();

    new StructureBuilder(this.config)
    .collect()
    .then(function(obj:{}) {
      d.resolve(this);
    })
    .catch(function(e) {
      console.log("Styleguide.read:", e);
      throw(e);
    });

    return d.promise;
  }

  // write down, what was read
  write() {

  }
}
