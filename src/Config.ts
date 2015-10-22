var objectAssign = require('object-assign');

interface AbstractConfig {
  config: Object;

  resolve<T>(path_or_object: T):Object;
  load<T,V>(options: T, defaults?: V):AbstractConfig;
}

export class ProjectConfig implements AbstractConfig {
  config: Object;

  resolve<T>(path_or_object: T) {
    var result:Object;

    if (typeof(path_or_object) == 'object') {
      // argument is a plain object
      result = path_or_object;
    } else if (typeof(path_or_object) == "string") {
      // argument is a string, so lets try to figure out what it is
      try {
        // lets see if the string contains a json object
        result = JSON.parse(path_or_object.toString());
      } catch (e) {
        try {
          // ok, it may be a file path
          result = require(path_or_object.toString());
        } catch(e) {
          throw(e);
        }
      }
    } else {
      throw("ProjectConfig.load: options type not supported, use either object or string (path to a json file or stringified json)");
    }

    return result;
  }

  load<T,V>(options: T, defaults?: V):ProjectConfig {
    var _options:Object = this.resolve(options);
    var _defaults:Object;

    if (defaults != null) {
       _defaults = this.resolve(options);
    } else {
      _defaults = {};
    }

    this.config = objectAssign({}, _defaults, _options);
    return this;
  }
}
