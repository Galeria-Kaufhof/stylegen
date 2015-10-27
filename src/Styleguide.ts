"use strict";

import * as path from 'path';
import * as Q from 'q';
import * as Handlebars from 'handlebars';
import {Config,IProjectConfig} from './Config';
import {StructureBuilder} from './StructureBuilder';
import {Node} from './Node';
import {IRenderer, HandlebarsRenderer} from './Renderer';

interface IStyleguideOptions {
  renderer?: IRenderer;
}

export class Styleguide {
  public config: IProjectConfig;
  public renderer: IRenderer;
  public nodes: Node[];

  constructor(options?: IStyleguideOptions) {
    // nodes build the structure of our styleguide
    this.nodes = [];

    /** if a renderer is configured in the initialize options, lets take it. */
    if (!!options && !!options.renderer) {
      this.renderer = options.renderer;
    } else {
      /** otherwise take the build in handlebars engine */
      this.renderer = new HandlebarsRenderer().setEngine(Handlebars);
    }
  }

  /*
   * Styleguide setup method to collect and merge configurations,
   * to set defaults and allow to overwrite them in the styleguide.json
   */
  initialize(cwd: string, upfrontRoot: string):Q.Promise<Styleguide> {
    var d:Q.Deferred<Styleguide> = Q.defer<Styleguide>();

    /**
     * retrieve the config and bootstrap the styleguide object.
     */
    new Config()
    .load(path.resolve(cwd, 'styleguide.json'), path.resolve(upfrontRoot, 'styleguide-defaults.json'))
    .then((mergedConfig: Config) => {
      this.config = mergedConfig;
      /** lets assure, that we have the current working directory in reach for later access */
      this.config.cwd = cwd;
      /** we sometimes need the upfront root, e.g. for file resolvement */
      this.config.upfrontRoot = upfrontRoot;

      /** each and every styleguide should have a name ;) */
      if (!this.config.name) {
        this.config.name = path.basename(this.config.cwd);
      }

      d.resolve(this);
    })
    .catch(function(e) {
      console.log("Styleguide.initialize:", e);
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

    /**
     * While this.nodes should represent our styleguide tree strucute, it is empty yet,
     * so lets start to fill it.
     *
     * A successful collect promise just resolves to `this`, so that we are able
     * to proceed with the information we collected in the read step. 
     */
    new StructureBuilder(this).collect()
    .then((obj:{}) => { d.resolve(this); })
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
