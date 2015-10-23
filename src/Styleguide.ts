import path = require('path');
import Q = require('q');

import config = require('./Config');
import StructureBuilder = require('./StructureBuilder');

export class Styleguide {
  config: config.ProjectConfig;

  initialize(cwd: string, upfrontRoot: string):Q.Promise<Styleguide> {
    var d:Q.Deferred<Styleguide> = Q.defer<Styleguide>();
    var self:Styleguide = this;

    new config.ProjectConfig()
    .load(path.resolve(cwd, 'styleguide.json'), path.resolve(upfrontRoot, 'defaults.json'))
    .then(function(mergedConfig: config.ProjectConfig) {
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

  read():Q.Promise<{}> {
    var d:Q.Deferred<{}> = Q.defer<{}>();

    // new StructureBuilder(this.config)
    // .build()
    // .then(function(obj:{}) {
    //   d.resolve(this);
    // })
    // .catch(function(e) {
    //   console.log("Styleguide.read:", e);
    //   throw(e);
    // });

    return d.promise;
  }

  write() {

  }
}
