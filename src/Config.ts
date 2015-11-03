"use strict";

import * as fs from 'fs';
import * as Q from 'q';
import {Partial, View} from './Templating';

/** general setup for configuration file loaders  */
interface IAbstractConfig {
  load<T,V>(options: T, defaults?: V):Q.Promise<IAbstractConfig>;
}

/** configuration structure for the general styleguide settings, aka. styleguide.json */
export interface IProjectConfig {
  cwd?: string;
  name?: string;
  upfrontRoot?: string;
  namespace?: string;
  componentPaths?: string[];
  target?: string[];
}

/** configuration structure for the component settings, aka. component.json */
export interface IComponentConfig {
  partials?: Partial[];
  view?: View;
  path?: string;
  namespace?: string;
  label?: string;
}

/** config, that is handed to nodes */
export interface INodeConfig {
  namespace?: string;
}

/** config for the renderer object */
export interface IRendererConfig {
  namespace?: string;
}

/**
 * Config resolver for conveniant merging of configuration options and defaults.
 */
export class Config implements IAbstractConfig {
  /**
   * this is the flesh and bones of the config resolving.
   * If it is a file, load the file, if it is a string containing
   * a json string parse it, and if it is an object it is already fine.
   */
  private resolve<T>(path_or_object: T):Q.Promise<{}> {
    var result:Object;
    var d:Q.Deferred<{}> = Q.defer<{}>();

    if (typeof(path_or_object) == 'object') {
      /** argument is a plain object */
      result = path_or_object;
      d.resolve(result);

    } else if (typeof(path_or_object) == "string") {
      /** argument is a string, so lets try to figure out what it is */
      try {
        /** lets see if the string contains a json object */
        result = JSON.parse(path_or_object.toString());
        d.resolve(result);
      } catch (e) {

        /** ok, it may be a file path, so lets resolve the file and return it as json object */
        Q.nfcall(fs.readFile, path_or_object)
        .then(function(buffer:Buffer) {
          /** catch and return json parsing errors */
          try {
            var result:string = JSON.parse(buffer.toString());
            d.resolve(result);
          } catch(e) {
            d.reject(e);
          }
        })
        .catch(function(e) {
          console.log("Config.resolve:readFile:", path_or_object);
          d.reject(e);
        });

      }
    } else {
      d.reject("IProjectConfig.load: options type not supported, use either object or string (path to a json file or stringified json)");
    }

    return d.promise;
  }

  /**
   * load supports different setups for configuration setup.
   * You may either pass in a file_path to options or defaults,
   * or the may also be an options hash,
   * or even a string containing json content.
   */
  load<T,V>(options: T, defaults?: V):Q.Promise<Config> {
    var _options:Q.Promise<{}> = this.resolve(options);
    var _defaults:Q.Promise<{}>;

    if (defaults != null) {
       _defaults = this.resolve(defaults);
    }

    /** cleanup defaults promise if not there ;) */
    var promises = [_defaults, _options].filter((x) => !!x);

    /** resolve config files */
    return Q.all(promises)
    .then(function(configs: [{}]) {

      /** return merged configuration */
      var result:Config = Object.assign.apply(this, configs);
      return result;
    })
  }
}
