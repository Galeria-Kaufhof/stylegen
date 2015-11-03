"use strict";

import * as path from 'path';
import * as Q from 'q';

import {IComponentConfig} from './Config';
import {Partial, View} from './Templating';

/**
 * Components are the representation of the real asset components,
 * that are represented by a component.json file inside of an component folder.
 * A Component has a one-to-one relationship to a Node.
 */
export class Component {
  id: string;
  partials: Partial[];
  view: View;
  config: IComponentConfig;

  /**
   * @param config - the parsed component.json file, enriched with current path and namespace.
   * @param parent - the parent is used to distuingish components and "sub"-components
   */
  constructor(config:IComponentConfig, parent?: Component) {
    this.config = config;
    /** TODO: handle parent resolution and sub component naming, atm. it is useless */
    this.id = `${this.config.namespace}.${path.basename(config.path)}`;
    console.log('Component:', this.id);
  }

  /**
   * a component may have several partials, that are component related view snippets,
   * that are reusable by other partials or view components.
   */
  private buildPartials():Q.Promise<Component> {
    if(!!this.config.partials) {

      /**
       * load all Partials
       */
      var partialPromises:Q.Promise<Partial>[] = this.config.partials.map((partialName:Partial) => {
        var p = path.resolve(this.config.path, partialName);
        /** add partial loading promise to promise collection */
        return new Partial(p).load();
      });

      return Q.all(partialPromises)
      .then((partials:Partial[]) => {
        this.partials = partials;
        return this;
      });

    /** when no partials are configured, look for _partial.hbs files in the current path */
    } else if(!this.config.partials) {
      // TODO: try to find  *_partial files in component path (this.config.path)
      this.partials = [];
      return Q(this);

    /** no partials configured, no problem.  */
    } else {
      this.partials = [];
      console.warn("Component.buildPartials", "Did not found any partials for Component", this.id);
      return Q(this);
    }
  }

  /**
   * at the moment a Component can have exactly one view,
   * that is available later as executable js function.
   *
   * A view is not reusable directly in other views,
   * to have a reusable snippet, register a Partial instead.
   */
  private buildView():Q.Promise<Component> {
    if(!!this.config.view) {
      var p = path.resolve(this.config.path, this.config.view);

      return new View(p).load()
      .then((view) => {
        this.view = view;
        return this;
      });

    /** no view configured, ok, lets look inside the current path for _view.hbs files */
    } else if(!this.config.view) {
      // TODO: try to find  *_view files in component path (this.config.path)
      return Q(this);

    /** no view found, no problem :) */
    } else {
      console.warn("Component.buildView", "Did not found a view for Component", this.id);
      return Q(this);
    }
  }


  /**
   * building a component means to retrieve the flesh and bones of the component,
   * that are described in its config
   *
   * --> Its Partials, its View, and later all other related stuff.
   */
  public build():Q.Promise<Component> {
    /** resolve the component partials at first */
    return this.buildPartials()
    /** after that lets read and build its view */
    .then(() => this.buildView());
  }
}
