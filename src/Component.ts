"use strict";

import * as path from 'path';
import * as fs from 'fs-extra';
import * as denodeify from 'denodeify';
import * as slug from 'slug';

var fsreaddir = denodeify(fs.readdir);

import {warn, error} from './Logger';
import {IRenderer} from './Renderer';
import {Partial} from './Partial';
import {View} from './View';
import {Node} from './Node';
import {Doc} from './Doc';
import {State, IStateConfig} from './State';

interface IStateConfigs {
  [id: string]: IStateConfig;
}

/** configuration structure for the component settings, aka. component.json */
export interface IComponentConfig {
  id?: string;
  partials?: string[];
  view?: View;
  path?: string;
  namespace?: string;
  label?: string;
  docs?: Doc[];
  tags?: string[];
  viewContext?: {};
  states?: IStateConfigs[];
}

/**
 * Components are the representation of the real asset components,
 * that are represented by a component.json file inside of an component folder.
 * A Component has a one-to-one relationship to a Node.
 */
export class Component {
  id: string;
  partials: Partial[];
  view: View;
  docs: Doc[];
  slug: string;
  tags: string[];
  htmlRenderer: IRenderer;
  states: State[];
  private path: string;


  /**
   * @param config - the parsed component.json file, enriched with current path and namespace.
   */
  constructor(public config:IComponentConfig, private node:Node) {
    this.id = this.config.id || path.basename(config.path);
    this.slug = `${this.config.namespace}-${this.config.slug || slug(this.id.toLowerCase())}`;

    // TODO: this is ugly and error-prone, we should clean this up to a separate property (falk)
    this.id = `${this.config.namespace}.${this.id}`;
    this.tags = this.config.tags;
    this.path = this.config.namespace !== "sg" ? this.config.path : this.node.options.styleguide.config.sgTemplateRoot;
  }

  /**
   * a component may have several partials, that are component related view snippets,
   * that are reusable by other partials or view components.
   */
  private buildPartials():Promise<Component> {
    var partialPromises:Promise<Partial>[];

    if(!!this.config.partials) {

      /**
       * load all Partials
       */
      partialPromises = this.config.partials.map((partialName:string) => {
        var p = path.resolve(this.path, partialName);
        return Partial.create(p, this.config.namespace).load();
      });

    /** when no partials are configured, look for _partial.hbs files in the current path */
    } else {
      // TODO: make _partial suffix configurable, along with the other references to it
      partialPromises = this.node.files.filter(x => new RegExp("^.*?_partial.hbs$").test(x)).map((partialName:string) => {
        var p = path.resolve(this.path, partialName);
        return Partial.create(p, this.config.namespace).load();
      });
    }

    return Promise.all(partialPromises)
    .then((partials:Partial[]) => {
      this.partials = partials;
      return this;
    });
  }

  /**
   * at the moment a Component can have exactly one view,
   * that is available later as executable js function.
   *
   * A view is not reusable directly in other views,
   * to have a reusable snippet, register a Partial instead.
   */
  private buildView():Promise<Component> {
    var viewPath:string;
    if(!!this.config.view) {
      viewPath = path.resolve(this.path, this.config.view);

    /** no view configured, ok, lets look inside the current path for _view.hbs files */
    } else {
      viewPath = this.node.files.find(x => new RegExp("^view.hbs$").test(x))

      if (!viewPath) {
        return Promise.resolve(this);
      }

      viewPath = path.resolve(this.path, viewPath);
    }

    return View.create(viewPath).load()
    .then((view) => {
      this.view = view;
      return this;
    });
  }

  /**
   * each component may have a map of documents,
   * provided by `id: filepath`.
   */
  private buildDocs():Promise<Component> {
    var docPromises:Promise<Doc>[];

    if(!!this.config.docs) {
      /**
       * load all Docs
       */
      var docs = this.config.docs;
      docPromises = Object.keys(docs).map((doc:string) => {
        var p = path.resolve(this.path, docs[doc]);
        /** add partial loading promise to promise collection */
        return Doc.create(p, doc).load();
      });

    } else {
      docPromises = this.node.files.filter(x => new RegExp("^.*?.md$").test(x)).map((doc:string) => {
        var p = path.resolve(this.path, doc);
        return Doc.create(p, doc).load();
      });
    }

    return Promise.all(docPromises)
    .then((loadedDocs:Doc[]) => {
      this.docs = loadedDocs;
      return this;
    });
  }

  /**
   * a Component may have several states like disabled, active and so on,
   * while that should be options in a view, you may give each state its own render context,
   * which will be passed to the view.
   *
   * So each state will result in a rendering of the original view, with this specific render context,
   * and its label and the possibility of an additional state document, that describes the "why and what".
   *
   * If any states are given, the original view is not printed. If you want it to, just
   * configure it for example as 'default' state.
   *
   * A state context may be an array of context objects. If so, the state view is rendered multiple times,
   * to give rendering examples of the state in different variants. E.g. take a button, that may be active,
   * and you want to show, how it looks for a button-tag and a link-tag with given classes.
   */
  private buildStates():Promise<Component> {
    var statePromises:Promise<State>[];

    if(!!this.config.states) {
      /** prepare states (and especially their docs) */
      statePromises = Object.keys(this.config.states).map((id) => {
        let config = this.config.states[id];
        return new State(id, this, config).load();
      });

    } else {
      statePromises = [Promise.resolve(null)];
    }

    return Promise.all(statePromises)
    .then((loadedStates:State[]) => {
      this.states = loadedStates;
      return this;
    });
  }

  /**
   * building a component means to retrieve the flesh and bones of the component,
   * that are described in its config
   *
   * --> Its Partials, its View, and later all other related stuff.
   */
  public build():Promise<Component> {
    /** resolve the component partials at first */
    return this.buildPartials()
    /** after that lets read and build its view */
    .then(() => this.buildView())
    .then(() => this.buildStates())
    .then(() => this.buildDocs())
    .catch(e => {
      error(e);
      error(e.stack);
      throw(e);
    });
  }
}
