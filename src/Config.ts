import * as fs from 'fs';
import * as Q from 'q';

interface AbstractConfig extends Object {
  config: Object;

  resolve<T>(path_or_object: T):Object;
  load<T,V>(options: T, defaults?: V):Q.Promise<AbstractConfig>;
}

class Config implements AbstractConfig {
  config: Object;

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
          .catch(function(e) { d.reject(e); });
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

  load<T,V>(options?: T, defaults?: V):Q.Promise<ProjectConfig> {
    var _options:Q.Promise<{}> = this.resolve(options);
    var _defaults:Q.Promise<{}>;

    var d:Q.Deferred<ProjectConfig> = Q.defer<ProjectConfig>();

    if (defaults != null) {
       _defaults = this.resolve(defaults);
    }

    if (options != null) {
       _options = this.resolve(options);
    }

    Q.all([_defaults, _options])
    .then(function(optionsList: [{}]) {
      var result:ProjectConfig = Object.assign.apply(this, optionsList);
      d.resolve(result);
    })
    .catch(function(e) {
      console.log(e);
      throw(e);
    });

    return d.promise;
  }
}

export class ProjectConfig extends Config {}
