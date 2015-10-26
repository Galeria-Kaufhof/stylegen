"use strict";

import * as path from 'path';
import * as Q from 'q';
import {Config,ProjectConfig} from './Config';
import {StructureBuilder} from './StructureBuilder';
import {Node} from './Node';

export class Styleguide {
  public config: ProjectConfig;
  public nodes: Node[];

  /*
   * Styleguide setup method to collect and merge configurations,
   * to set defaults and allow to overwrite them in the styleguide.json
   */
  initialize(cwd: string, upfrontRoot: string):Q.Promise<Styleguide> {
    var d:Q.Deferred<Styleguide> = Q.defer<Styleguide>();

    this.nodes = [];

    new Config()
    .load(path.resolve(cwd, 'styleguide.json'), path.resolve(upfrontRoot, 'styleguide-defaults.json'))
    .then((mergedConfig: Config) => {
      this.config = mergedConfig;
      this.config.cwd = cwd;
      this.config.upfrontRoot = upfrontRoot;

      if (!this.config.name) {
        this.config.name = path.basename(this.config.cwd);
      }

      d.resolve(this);
    })
    .catch(function(e) {
      console.log("Styleguide.initialize:",e);
      throw(e);
    });

    return d.promise;
  }

  /*
   * walk the configured styleguide folders and read in the several components, pages, navigation, etc.,
   * and store the information inside the styleguide properties.
   */
  read():Q.Promise<Styleguide> {
    var d:Q.Deferred<Styleguide> = Q.defer<Styleguide>();

    new StructureBuilder(this)
    .collect()
    .then((obj:{}) => {
      d.resolve(this);
    })
    .catch(function(e) {
      console.log("Styleguide.read:", e);
      throw(e);
    });

    return d.promise;
  }

  /*
   * write down, what was read
   */
  write() {

  }
}
