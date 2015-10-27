"use strict";

import * as path from 'path';
import * as Q from 'q';
import * as fs from 'fs';

import {Config,IComponentConfig} from './Config';
import {Component} from './Component';
import {Partial} from './Templating';

export class Node {
  id: string;
  path: string;
  files: string[];
  children: Node[];
  config: IComponentConfig;
  component: Component;

  // , files:[string]
  constructor(nodePath:string, parent?:Node, options?:{}) {
    var parentPath:string;

    if (!parent) {
      parentPath = path.resolve(nodePath, '..');
    } else {
      parentPath = parent.path;
    }

    var nodeName:string = nodePath.slice(parentPath.length + 1);

    this.id = nodeName;
    // this.files = files;
    this.path = nodePath;
  }

  isComponent():boolean {
    return !!this.component;
  }

  resolveComponent():Q.Promise<Node> {
    var d:Q.Deferred<Node> = Q.defer<Node>();

    var componentConfigPath:string = this.files.find((x) => x == 'component.json');

    if (componentConfigPath) {
      // TODO: merge in default configuration for components
      new Config().load(path.resolve(this.path, componentConfigPath))
      .then((config:IComponentConfig) => {
        config.path = this.path;

        new Component(config).build()
        .then((component) => {
          this.component = component;
          d.resolve(this);
        })
        .catch((e) => d.reject(e));
      })
      .catch((e) => {
        console.log("Node.resolveComponent", e);
        d.reject(e);
      });
    } else { d.resolve(this); };

    return d.promise;
  }

  handleFileByType(file:string, parent:Node):Q.Promise<Node> {
    var d:Q.Deferred<Node> = Q.defer<Node>();

    fs.stat(path.resolve(this.path, file), (err, stat) => {
      if (err) {
        d.reject(err);
      } else {
        if (stat && stat.isDirectory()) {
          /** so, ok, we have a directory, so lets build the sub tree  */

          d.resolve(this);
        } else {
          d.resolve(this);
        }
      }
    });
    return d.promise;
  }

  resolve():Q.Promise<Node> {
    var d:Q.Deferred<Node> = Q.defer<Node>();

    /**
     * get all files inside this node, and go on.
     */
    Q.nfcall(fs.readdir, this.path)
    .then((files:[string]) => {
      this.files = files;

      /**
       * lets resolve the component parts of this node, like component.json
       * and referenced partials, etc.
       */
      return this.resolveComponent();
    })
    .then((node) => {
      /**
       * because we have handled the current levels component.json already,
       * lets handle the other files without taking it into account again.
       */
      var alreadyProcessed = ['component.json'];
      /**
       * add partials to those files, which are already handled in the beforehand component lookup
       */
      var partialNames = this.component.partials.map((p:Partial) => p.name);
      [].push.apply(alreadyProcessed, this.component.partials.map((p:Partial) => p.name));

      /**
       * Lets handle the leftover files, (at the moment it should only be sub folders, that may be child nodes)
       */
      var filePromises = this.files
      // remove the processed files
      .filter((f) => { return alreadyProcessed.indexOf(f) < 0 })
      // collect the others
      .map((f) => { return this.handleFileByType(f, node); });

      Q.all(filePromises)
      .then((results) => {
        d.resolve(node);
      })
      .catch((e) => d.reject(e));

    })
    .catch((e) => d.reject(e));
    return d.promise;
  }
}
