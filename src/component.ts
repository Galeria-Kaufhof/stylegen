"use strict";

import * as path from 'path';
import * as Q from 'q';

import {IComponentConfig} from './Config';
import {Partial, View} from './Templating';

export class Component {
  id: string;
  partials: Partial[];
  view: View;
  config: IComponentConfig;

  constructor(config:IComponentConfig, parent?: Component) {
    this.config = config;
    this.id = `${this.config.namespace}.${path.basename(config.path)}`;
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
      console.warn("Component.buildPartials", "Did not found any partials for Component", this.id);
      d.resolve(this);
    }

    return d.promise;
  }

  buildView():Q.Promise<Component> {
    var d:Q.Deferred<Component> = Q.defer<Component>();

    if(!!this.config.view) {
      var p = path.resolve(this.config.path, this.config.view);
      new View(p).load()
      .then((view) => {
        this.view = view;
        d.resolve(this)
      })
      .catch(e => d.reject(e));
    } else if(!this.config.view) {
      // TODO: try to find  *_view files in component path (this.config.path)
      d.resolve(this);
    } else {
      console.warn("Component.buildView", "Did not found a view for Component", this.id);
      d.resolve(this);
    }

    return d.promise;
  }

  build():Q.Promise<Component> {
    var d:Q.Deferred<Component> = Q.defer<Component>();

    this.buildPartials()
    // TODO: finish component building
    .then(() => {
      return this.buildView();
    })
    .then((component) => {
      d.resolve(component);
    })
    .catch(e => d.reject(e));

    return d.promise;
  }
}
