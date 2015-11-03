"use strict";

import * as path from 'path';
import * as fs from 'fs';
import * as denodeify from 'denodeify';

import {Config, INodeConfig, IComponentConfig} from './Config';
import {Component} from './Component';
import {Partial} from './Templating';

var fsstat = denodeify(fs.stat);
var fsreaddir = denodeify(fs.readdir);

/**
 * a Node represents a folder-node inside of the configured component paths.
 * It may have a Component (1-to-1), but maybe it is just a container for
 * child nodes, that are components.
 *
 * TODO: i guess nodes may also be pages
 */
export class Node {
  id: string;
  path: string;
  files: string[];
  children: Node[];
  component: Component;

  constructor(nodePath:string, public parent?:Node, public config?:INodeConfig) {
    var nodeName:string = path.basename(nodePath);

    this.id = nodeName;
    this.path = nodePath;
  }

  /**
   * recursive node lookup for a component path.
   */
  private nodesForDirectories(file:string, parent:Node):Promise<Node> {
    var filePath = path.resolve(this.path, file);

    return fsstat(filePath)
    .then((stats:fs.Stats) => {
      if (stats && stats.isDirectory()) {
        /** so, ok, we have a directory, so lets build the sub tree  */
        return new Node(filePath, parent, this.config).resolve();
      } else {
        return null;
      }
    });
  }

  /**
   * Find out if a node has a component configurations and create a Component, if it is so.
   */
  private resolveComponent():Promise<Node> {
    var componentConfigPath:string = this.files.find((x) => x == 'component.json');

    if (!!componentConfigPath) {
      // TODO: merge in default configuration for components
      return new Config().load(path.resolve(this.path, componentConfigPath))
      .then((config:IComponentConfig) => {
        var parentComponent:Component;

        /**
         * attach the current path to the config, to make it
         * available to the component.
         */
        config.path = this.path;

        /**
         * namespace can be configured in component.json,
         * if it is not, take the configured namespace of the project config.
         * If it is also  not set, take app as default.
         */
        if (!config.namespace && !!this.config.namespace) {
          config.namespace = this.config.namespace;
        } else if (!config.namespace) {
          config.namespace = 'app';
        }

        /**
         * if the parent node is also a component, lets handle this node
         * as sub component to the parent one.
         */
        if (!!this.parent && this.parent.isComponent()) {
          parentComponent = this.parent.component;
        }

        return new Component(config, parentComponent).build()
        .then((component) => {
          this.component = component;
          return this;
        });
      });

    } else { return new Promise((resolve) => resolve(this)); };

  }

  private resolveChildren():Promise<Node> {
    /**
     * because we have handled the current levels component.json already,
     * lets handle the other files without taking it into account again.
     */
    var alreadyProcessed = ['component.json'];
    /**
     * add partials to those files, which are already handled in the beforehand component lookup
     */
    if (this.isComponent() && !!this.component.partials) {
      var partialNames = this.component.partials.map((p:Partial) => p.name);
      [].push.apply(alreadyProcessed, this.component.partials.map((p:Partial) => p.name));
    }

    /**
     * Lets handle the leftover files, (at the moment it should only be sub folders, that may be child nodes)
     */
    var filePromises = this.files
    // remove the processed files
    .filter((f) => { return alreadyProcessed.indexOf(f) < 0 })
    // collect the others
    .map((f) => { return this.nodesForDirectories(f, this); });

    return Promise.all(filePromises)
    .then((childNodes) => {
      this.children = childNodes.filter(n => n !== null);
      return this;
    });
  }

  public isComponent():boolean {
    return !!this.component;
  }

  public resolve():Promise<Node> {
    /**
     * get all files inside this node, and go on.
     */
    return fsreaddir(this.path)
    .then((files:[string]) => {
      this.files = files;

      /**
       * lets resolve the component parts of this node, like component.json
       * and referenced partials, etc.
       */
      return this.resolveComponent();
    })
    .then((node) => {
      return this.resolveChildren();
    });
  }
}
