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
import {LinkRegistry} from './LinkRegistry';

import {Doc} from './Doc';
import {Partial} from './Partial';
import {View} from './View';

import {MarkdownRenderer} from './MarkdownRenderer';
import {HandlebarsRenderer} from './HandlebarsRenderer';

var fsensuredir = denodeify(fs.ensureDir);
var fscopy = denodeify(fs.copy);
var outputfile = denodeify(fs.outputFile);

var flatten = (list) => list.reduce(
  (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);

interface IStyleguideOptions {
  configPath?: string;
  target?: string;
  cwd?: string;
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
  sgTemplateRoot?: string;
  componentDocs?: string;
}

export class Styleguide {
  public htmlRenderer: IRenderer;
  private docRenderer: IRenderer;

  public config: IStyleguideConfig;
  public renderer: IRenderer;
  public nodes: Node[];
  public components: ComponentList;
  public linkRegistry: LinkRegistry;
  // public docFactory: DocFactory;

  constructor(private options?: IStyleguideOptions) {
    // nodes build the structure of our styleguide
    this.nodes = [];
    this.components = new ComponentList();
  }

  /*
   * Styleguide setup method to collect and merge configurations,
   * to set defaults and allow to overwrite them in the styleguide.json
   */
  initialize(cwd: string, stylegenRoot?: string):Promise<Styleguide> {
    return new Promise<Styleguide>((resolve, reject) => {
      var configPath:string;
      this.options = !!this.options ? this.options : {}

      if (!stylegenRoot) {
        stylegenRoot = path.resolve(__dirname, '..');
      }

      if(!!this.options && !!this.options.configPath) {
        configPath = this.options.configPath;
      } else {
        var jsonConfig = path.resolve(cwd, 'styleguide.json');
        var yamlConfig = path.resolve(cwd, 'styleguide.yaml');

        var stat;
        try { stat = fs.statSync(jsonConfig); } catch(e) {}

        configPath = !!stat ? jsonConfig : yamlConfig;
      }


      var configurations:any[] = [configPath, path.resolve(stylegenRoot, 'styleguide-defaults.yaml')];

      configurations.unshift(this.options);


      /**
       * retrieve the config and bootstrap the styleguide object.
       */
      return new Config()
      .load(...configurations)
      .then((mergedConfig: Config) => {
        this.config = mergedConfig;

        /** lets assure, that we have the current working directory in reach for later access */
        this.config.cwd = cwd;

        /** we sometimes need the stylegen root, e.g. for file resolvement */
        this.config.stylegenRoot = stylegenRoot;

        this.config.componentPaths.push(path.resolve(stylegenRoot, "styleguide-components"));

        this.config.target = path.resolve(cwd, this.config.target);

        if (!this.config.sgTemplateRoot) {
          this.config.sgTemplateRoot = path.resolve(path.dirname(require.resolve('stylegen-theme-flatwhite')), 'dist');
        }

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
            try {
              var partialLibPath = path.resolve(this.config.cwd, p);
              if (fs.statSync(partialLibPath)) {
                return require(partialLibPath);
              }
            } catch(e) { warn("Styleguide.initialize", "not existing partial lib referenced"); return null; }
          });
        }

        this.htmlRenderer = new HandlebarsRenderer(rendererConfig);
        this.linkRegistry = new LinkRegistry();
        this.docRenderer = new MarkdownRenderer({ "htmlEngine": this.htmlRenderer, "linkRegistry": this.linkRegistry });

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
    return fsensuredir(path.resolve(this.config.cwd, this.config.target, 'assets'))
    /** copy the styleguide related assets */
    .then(() => {
      return fscopy(
        path.resolve(this.config.sgTemplateRoot, 'stylegen-assets'),
        // TODO: make "assets" path configurable
        path.resolve(this.config.cwd, this.config.target, 'stylegen-assets'));
    })
    /** copy the app specific assets, configured in styleguide config */
    .then(() => {
      if (!!this.config.assets) {

        var copyPromises = this.config.assets.map((asset:IAssetCopyConfig) => {
          return fscopy(
            path.resolve(this.config.cwd, asset.src),
            path.resolve(this.config.cwd, this.config.target, asset.target));
        });

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
