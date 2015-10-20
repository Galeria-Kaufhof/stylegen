"use strict";

var path = require('path');
var Q = require('q');

var fs = require('fs');
// promisify our file reader
var readFile = Q.nfbind(fs.readFile);
var lemming = require('lemming');

class Component {
  constructor(basePath, configPath, config) {
    this.config = config;
    this.config.rootPath = configPath;
    this.config.directory = path.dirname(configPath);
    this.config.componentBasePath = basePath;
    this.config.relativeComponentPath = this.config.directory.slice(this.config.componentBasePath.length);
    if (!!this.config.id) {
      this.id = this.config.id;
    } else {
      this.id = this.config.id = path.basename(this.config.relativeComponentPath, '.json');
    }
  }

  loadFiles(files) {
    var d = Q.defer();

    if(!!files && files.length > 0) {
      Q.all(files.map((file) => readFile(path.resolve(this.config.directory, file) )))
      .then((files) => {
        d.resolve(files.map((f) => f.toString()));
      })
      .catch((e) => d.reject(e));
    } else {
      d.resolve([]);
    }

    return d.promise;
  }

  loadFile(file) {
    var d = Q.defer();

    if(!!file) {
      readFile(path.resolve(this.config.directory, file))
      .then((file) => {
        d.resolve(file.toString());
      })
      .catch((e) => d.reject(e));
    } else {
      d.resolve(null);
    }

    return d.promise;
  }

  loadPartials(options) {
    var d = Q.defer();

    this.loadFiles(this.config.partials)
    .then((files) => {
      this.partials = files;
      options.renderer.registerPartials(this, options.namespace, options);
      d.resolve(this);
    })
    .catch((e) => d.reject(e));

    return d.promise;
  }

  loadView(options) {
    var d = Q.defer();

    this.loadFile(this.config.view)
    .then((file) => {
      if (!!file) {
        this.view = file;
        this.template = options.renderer.template(this, options);
      } else {
        this.view = this.template = null;
      }
      d.resolve(this);
    })
    .catch((e) => d.reject(e));

    return d.promise;
  }
}


module.exports = {
  loadConfig(file) {
    var d = Q.defer();

    readFile(file)
    .then((content) => {
      d.resolve({
        "path": file
        , "content": content
      });
    })
    .catch((e) => deferred.reject(e));

    return d.promise;
  } ,


  search(options) {
    // resolve pathes to absolute to absolute path format
    var paths = options.componentPaths.map((p) => path.resolve(options.cwd, p));
    var deferred = Q.defer();

    Q.all(paths.map((p) => lemming.walk(p)))
    .then((files) => {
      // flatten and filter for config files
      var configFiles = [].concat.apply([], files)
      .filter((file) => file.match(/component\.json$/));

      // get all config files and return a list of components initialized by these
      return Q.all(configFiles.map(this.loadConfig));
    })
    .then((files) => {

      var componentList = files.map((file) => {
        var componentPath = paths.find((p) => file.path.indexOf(p) === 0);
        return new Component(componentPath, file.path, JSON.parse(file.content));
      });
      deferred.resolve(componentList);

    })
    .catch((e) => deferred.reject(e));

    return deferred.promise;
  }
};
