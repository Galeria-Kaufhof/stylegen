"use strict";

import * as path from 'path';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import {Config} from './Config';
import {StructureReader} from './StructureReader';
import {StructureWriter} from './StructureWriter';
import {Node} from './Node';
import {Component} from './Component';
import {ComponentList} from './ComponentList';
import {IRenderer, IRendererOptions} from './Renderer';
import {HandlebarsRenderer} from './HandlebarsRenderer';
import {ComponentRegistry} from './ComponentRegistry';
import {ComponentWriter} from './ComponentWriter';

Handlebars.registerHelper("pp", function(object){
  return new Handlebars.SafeString(JSON.stringify(object));
});

interface IStyleguideOptions {
  renderer?: IRenderer;
}

/** configuration structure for the general styleguide settings, aka. styleguide.json */
export interface IProjectConfig {
  cwd?: string;
  name?: string;
  upfrontRoot?: string;
  namespace?: string;
  componentPaths?: string[];
  target?: string[];
  dependencies?: any;
}

export class Styleguide {
  public config: IProjectConfig;
  public renderer: IRenderer;
  public nodes: Node[];
  public components: ComponentList;

  constructor(options?: IStyleguideOptions) {
    // nodes build the structure of our styleguide
    this.nodes = [];
    this.components = new ComponentList();
    console.log(this.components);
  }

  /*
   * Styleguide setup method to collect and merge configurations,
   * to set defaults and allow to overwrite them in the styleguide.json
   */
  initialize(cwd: string, upfrontRoot: string):Promise<Styleguide> {
    return new Promise<Styleguide>((resolve, reject) => {
      var jsonConfig = path.resolve(cwd, 'styleguide.json');
      var yamlConfig = path.resolve(cwd, 'styleguide.yaml');

      fs.exists(jsonConfig, (exists) => {
        var configPath:string = exists ? jsonConfig : yamlConfig;

        /**
         * retrieve the config and bootstrap the styleguide object.
         */
        new Config()
        .load(configPath, path.resolve(upfrontRoot, 'styleguide-defaults.yaml'))
        .then((mergedConfig: Config) => {
          this.config = mergedConfig;
          /** lets assure, that we have the current working directory in reach for later access */
          this.config.cwd = cwd;
          /** we sometimes need the upfront root, e.g. for file resolvement */
          this.config.upfrontRoot = upfrontRoot;
          this.config.componentPaths.push(path.resolve(upfrontRoot, "styleguide-components"));
          /** each and every styleguide should have a name ;) */
          if (!this.config.name) {
            this.config.name = path.basename(this.config.cwd);
          }

          // TODO: think about configurability of the renderer, and how to apply constructor options
          /** if a renderer is configured in the initialize options, lets take it. */
          // if (!!options && !!options.renderer) {
          //   this.renderer = options.renderer;
          // } else {
            /** otherwise take the build in handlebars engine */
          var rendererConfig:IRendererOptions = {};
          rendererConfig.namespace = this.config.namespace;
          this.renderer = new HandlebarsRenderer(rendererConfig).setEngine(Handlebars);
          // }

          resolve(this);
        })
        .catch(function(e) {
          console.log("Styleguide.initialize:", e);
          reject(e);
        });
      });
    });
  }

  /*
   * walk the configured styleguide folders and read in the several components, pages, navigation, etc.,
   * and store the information inside the styleguide properties.
   */
  public read():Promise<Styleguide> {

    /**
     * While this.nodes should represent our styleguide tree strucute, it is empty yet,
     * so lets start to fill it.
     *
     * A successful collect promise just resolves to `this`, so that we are able
     * to proceed with the information we collected in the read step.
     */
    return new StructureReader(this)
    .collect()
    .then((reader:StructureReader) => {
      return this;
    });
  }

  /*
   * write down, what was read, so make sure you read before :)
   */
  public write():Promise<Styleguide> {
    return new StructureWriter(this.renderer, this.nodes, this)
    .setup()
    .then((structureWriter) => {
      return structureWriter.write();
    })
    .then((result) => this);
  }
}
