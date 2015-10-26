"use strict";

import * as fs from 'fs';
import * as Q from 'q';

interface AbstractConfig {
  resolve<T>(path_or_object: T):Object;
  load<T,V>(options: T, defaults?: V):Q.Promise<AbstractConfig>;
}

export interface ProjectConfig {
  cwd?:string;
  name?:string;
  upfrontRoot?:string;
}

export interface ComponentConfig {
}

export class Config implements AbstractConfig {
  resolve<T>(path_or_object: T):Q.Promise<{}> {
    var result:Object;
    var d:Q.Deferred<{}> = Q.defer<{}>();

    if (typeof(path_or_object) == 'object') {
      // argument is a plain object
      result = path_or_object;
      d.resolve(result);
    } else if (typeof(path_or_object) == "string") {
      // argument is a string, so lets try to figure out what it is
      try {
        // lets see if the string contains a json object
        result = JSON.parse(path_or_object.toString());
        d.resolve(result);
      } catch (e) {
        try {
          // ok, it may be a file path, so lets resolve the file and return it as json object
          Q.nfcall(fs.readFile, path_or_object)
          .then(function(buffer:Buffer) {
            // catch and return json parsing errors
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
        } catch(e) {
          console.warn(e)
          // result = {};
          d.resolve({});
        }
      }
    } else {
      d.reject("ProjectConfig.load: options type not supported, use either object or string (path to a json file or stringified json)");
    }

    return d.promise;
  }

  load<T,V>(options?: T, defaults?: V):Q.Promise<Config> {
    var _options:Q.Promise<{}> = this.resolve(options);
    var _defaults:Q.Promise<{}>;

    var d:Q.Deferred<Config> = Q.defer<Config>();

    if (defaults != null) {
       _defaults = this.resolve(defaults);
    }

    if (options != null) {
       _options = this.resolve(options);
    }

    var promises = [_defaults, _options].filter((x) => !!x);

    Q.all(promises)
    .then(function(configs: [{}]) {
      var result:Config = Object.assign.apply(this, configs);
      d.resolve(result);
    })
    .catch(function(e) {
      console.log("Config.load", e);
      throw(e);
    });

    return d.promise;
  }
}
