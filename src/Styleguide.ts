"use strict";

import * as path from 'path';
import * as denodeify from 'denodeify';
import * as fs from 'fs-extra';


import {success, warn, error} from './Logger';
import {Config} from './Config';
import {StructureReader} from './StructureReader';
import {StructureWriter} from './StructureWriter';
import {Node} from './Node';
import {ComponentList} from './ComponentList';
import {IRenderer, IRendererOptions} from './Renderer';
import {IPageConfig} from './Page';

import {Doc} from './Doc';
import {Partial} from './Partial';
import {View} from './View';

import {MarkdownRenderer} from './MarkdownRenderer';
import {HandlebarsRenderer} from './HandlebarsRenderer';

var mkdirs = denodeify(fs.mkdirs);
var copy = denodeify(fs.copy);
var outputfile = denodeify(fs.outputFile);

var flatten = (list) => list.reduce(
  (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);

interface IStyleguideOptions {
  renderer?: IRenderer;
}

interface IAssetCopyConfig {
  src?: string;
  target?: string;
}

/** configuration structure for the general styleguide settings, aka. styleguide.json */
export interface IStyleguideConfig {
  cwd?: string;
  name?: string;
  stylegenRoot?: string;
  namespace?: string;
  componentPaths?: string[];
  target?: string;
  dependencies?: any;
  content?: IPageConfig[];
  assets?: IAssetCopyConfig[];
  version?: string;
  partials?: string[];
}

export class Styleguide {
  public htmlRenderer: IRenderer;
  private docRenderer: IRenderer;

  public config: IStyleguideConfig;
  public renderer: IRenderer;
  public nodes: Node[];
  public components: ComponentList;
  // public docFactory: DocFactory;

  constructor(options?: IStyleguideOptions) {
    // nodes build the structure of our styleguide
    this.nodes = [];
    this.components = new ComponentList();
  }

  /*
   * Styleguide setup method to collect and merge configurations,
   * to set defaults and allow to overwrite them in the styleguide.json
   */
  initialize(cwd: string, stylegenRoot: string):Promise<Styleguide> {
    return new Promise<Styleguide>((resolve, reject) => {
      var jsonConfig = path.resolve(cwd, 'styleguide.json');
      var yamlConfig = path.resolve(cwd, 'styleguide.yaml');

      var stat;
      try { stat = fs.statSync(jsonConfig); } catch(e) {}

      var configPath:string = !!stat ? jsonConfig : yamlConfig;
      /**
       * retrieve the config and bootstrap the styleguide object.
       */
      return new Config()
      .load(configPath, path.resolve(stylegenRoot, 'styleguide-defaults.yaml'))
      .then((mergedConfig: Config) => {
        this.config = mergedConfig;

        /** lets assure, that we have the current working directory in reach for later access */
        this.config.cwd = cwd;

        /** we sometimes need the stylegen root, e.g. for file resolvement */
        this.config.stylegenRoot = stylegenRoot;

        this.config.componentPaths.push(path.resolve(stylegenRoot, "styleguide-components"));

        this.config.target = path.resolve(cwd, this.config.target);

        /** each and every styleguide should have a name ;) */
        if (!this.config.name) {
          this.config.name = path.basename(this.config.cwd);
        }

        if (!this.config.version) {
          this.config.version = '0.0.1';
        }

        var rendererConfig:IRendererOptions = {};
        rendererConfig.namespace = this.config.namespace;

        if (this.config.partials) {
          rendererConfig.partialLibs = this.config.partials.map(p => {
            // TODO: exists is deprecated
            try {
              var partialLibPath = path.resolve(this.config.cwd, p);
              if (fs.statSync(partialLibPath)) {
                return require(partialLibPath);
              }
            } catch(e) { warn("Styleguide.initialize", "not existing partial lib referenced"); return null; }
          });
        }

        // TODO: hand in options for renderers
        this.htmlRenderer = new HandlebarsRenderer(rendererConfig);
        this.docRenderer = new MarkdownRenderer({ "htmlEngine": this.htmlRenderer });

        Doc.setRenderer(this.docRenderer);
        Partial.setRenderer(this.htmlRenderer);
        View.setRenderer(this.htmlRenderer);

        resolve(this);
      })
      .catch(function(e) {
        error("Styleguide.initialize:", e.message);
        console.log(e.stack);
        reject(e);
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
      success("Styleguide.write", "writer setup finished");
      return structureWriter.write();
    })
    .then((result) => this);
  }

  /*
   * write down, what was read, so make sure you read before :)
   */
  public export():Promise<Styleguide> {
    success("Styleguide.export", "creating export ....");

    // TODO: move to Partial export function
    var partials = this.components.all()
    .filter((c) => c.config.namespace === this.config.namespace)
    .filter((c) => c.partials.length > 0)
    .map(c => c.partials.map(p => p.registerable));

    partials = flatten(partials);

    var partialsTemplate = `exports.partials = function(engine, atob){
      ${partials.join("\n")}
    };`;

    return outputfile(path.resolve('.', 'partials.js'), partialsTemplate)
    .then(() => {
      return Promise.resolve(this);
    });
  }

  /*
   * write down, what was read, so make sure you read before :)
   */
  public prepare():Promise<Styleguide> {
    return mkdirs(path.resolve(this.config.cwd, this.config.target, 'assets'))
    /** copy the styleguide related assets */
    .then(() => {
      return copy(
        path.resolve(this.config.stylegenRoot, 'styleguide-assets'),
        // TODO: make "assets" path configurable
        path.resolve(this.config.cwd, this.config.target, 'assets')
      );
    })
    /** copy the app specific assets, configured in styleguide config */
    .then(() => {
      if (!!this.config.assets) {

        var copyPromises = this.config.assets.map((asset:IAssetCopyConfig) => {
          return copy(
            path.resolve(this.config.cwd, asset.src),
            path.resolve(this.config.cwd, this.config.target, asset.target));
        })

        return Promise.all(copyPromises);
      } else {
        warn("Styleguide.prepare", "No additional assets configured");
        return Promise.resolve([]);
      }
    })
    .then(() => {
      return this;
    });
  }
}
