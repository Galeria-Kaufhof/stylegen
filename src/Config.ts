"use strict";

import * as fs from 'fs';
import * as path from 'path';
import * as denodeify from 'denodeify';
import * as YAML from 'js-yaml';

import {Partial, View} from './Templating';

var fsreadfile = denodeify(fs.readFile);

/** general setup for configuration file loaders  */
interface IAbstractConfig {
  load<T,V>(options: T, defaults?: V):Promise<IAbstractConfig>;
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
  private resolve<T>(path_or_object: T):Promise<{}> {
    var result:Object;
    return new Promise((resolve, reject) => {

      if (typeof(path_or_object) == 'object') {
        /** argument is a plain object */
        result = path_or_object;
        resolve(result);

      } else if (typeof(path_or_object) == "string") {
        /** argument is a string, so lets try to figure out what it is */
        try {
          /** lets see if the string contains a json object */
          result = JSON.parse(path_or_object.toString());
          resolve(result);
        } catch (e) {

          /** ok, it may be a file path, so lets resolve the file and return it as json object */
          fsreadfile(path_or_object.toString())
          .then(function(buffer:Buffer) {
            /** catch and return json parsing errors */
            try {
              var result:string;
              if (path.extname(path_or_object.toString()) === '.yml'
                  || path.extname(path_or_object.toString()) === '.yaml') {
                result = YAML.safeLoad(buffer.toString());
              } else {
                result = JSON.parse(buffer.toString());
              }

              resolve(result);
            } catch(e) {
              reject(e);
            }
          })
          .catch((e) => {
            console.error("Config.resolve:readFile:", path_or_object);
            reject(e);
          });

        }
      } else {
        reject("IStyleguideConfig.load: options type not supported, use either object or string (path to a json file or stringified json)");
      }

    });
  }

  /**
   * load supports different setups for configuration setup.
   * You may either pass in a file_path to options or defaults,
   * or the may also be an options hash,
   * or even a string containing json content.
   */
  load<T,V>(options: T, defaults?: V):Promise<Config> {
    var _options:Promise<{}> = this.resolve(options);
    var _defaults:Promise<{}>;

    if (defaults != null) {
       _defaults = this.resolve(defaults);
    }

    /** cleanup defaults promise if not there ;) */
    var promises = [_defaults, _options].filter((x) => !!x);

    /** resolve config files */
    return Promise.all(promises)
    .then(function(configs: [{}]) {

      /** return merged configuration */
      var result:Config = Object.assign.apply(this, configs);
      return result;
    })
  }
}
