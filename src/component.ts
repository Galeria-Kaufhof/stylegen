"use strict";

import * as path from 'path';
import * as Q from 'q';

import {IComponentConfig} from './Config';
import {Partial} from './Templating';

export class Component {
  partials: Partial[];
  config: IComponentConfig;

  constructor(config:IComponentConfig) {
    this.config = config;
  }

  buildPartials():Q.Promise<Component> {
    var d:Q.Deferred<Component> = Q.defer<Component>();

    if(!!this.config.partials) {
      var partialPromises:Q.Promise<Partial>[] = this.config.partials.map((partialName:Partial) => {
        var p = path.resolve(this.config.path, partialName);
        return new Partial(p).load();
      });

      Q.all(partialPromises)
      .then((partials:Partial[]) => {
        this.partials = partials;
        d.resolve(this);
      })
      .catch((e) => { d.reject(e); });

    } else if(!this.config.partials) {
      // TODO: try to find  *_partial files in component path (this.config.path)
      this.partials = [];
      d.resolve(this);
    } else {
      this.partials = [];
      console.warn("Component.build", "Did not found any partials for Component", this)
      d.resolve(this);
    }

    return d.promise;
  }

  build():Q.Promise<Component> {
    var d:Q.Deferred<Component> = Q.defer<Component>();

    Q.all([this.buildPartials()])
    // TODO: finish component building
    .then((ignore) => {
      d.resolve(this);
    })
    .catch(e => d.reject(e));
    return d.promise;
  }
}
