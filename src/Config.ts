"use strict";

import * as fs from 'fs-extra';
import * as path from 'path';
import * as denodeify from 'denodeify';
import * as YAML from 'js-yaml';

import {error} from './Logger';

var fsreadfile = denodeify(fs.readFile);

/** general setup for configuration file loaders  */
interface IAbstractConfig {
  load<T,V>(options: T, defaults?: V):Promise<IAbstractConfig>;
}

/**
 * Config resolver for conveniant merging of configuration options and defaults.
 */
export class Config implements IAbstractConfig {
  private parseFileContent(filePath: string, buffer: Buffer):Object {
    var result: Object;

    if (path.extname(filePath) === '.yml' || path.extname(filePath) === '.yaml') {

      result = YAML.safeLoad(buffer.toString());
    } else {
      result = JSON.parse(buffer.toString());
    }

    return result;
  }


  private resolveFile(filePath:string):Promise<{}> {
    return fsreadfile(filePath)
    .then((buffer:Buffer) => {
      /** catch and return json parsing errors */

      try {
        return this.parseFileContent(filePath, buffer);
      } catch(e) {
        error("Config.resolveFile:", "ParseError", filePath);
        error(e.stack);
        return Promise.reject(e);
      }
    });
  }

  /**
   * this is the flesh and bones of the config resolving.
   * If it is a file, load the file, if it is a string containing
   * a json string parse it, and if it is an object it is already fine.
   */
  private resolve(path_or_object: any):Promise<{}> {
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
          resolve(this.resolveFile(path_or_object.toString()));
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
  load(...options: any[]):Promise<Config> {
    var promises = options.map(x => this.resolve(x)).reverse();

    /** resolve config files */
    return Promise.all(promises)
    .then(function(configs: {}[]) {

      configs = configs.filter(x => !!x);
      if (configs.length < 1) {
        configs.push({});
      }

      /** return merged configuration */
      var result:Config = Object.assign.apply(this, configs);
      return result;
    });
  }
}
