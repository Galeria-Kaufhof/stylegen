"use strict";

import * as path from 'path';
import * as Q from 'q';
import * as fs from 'fs';

import {Config,ComponentConfig} from './Config';
import {Component} from './Component';

export class Node {
  id: string;
  path: string;
  files: string[];
  children: Node[];
  config: ComponentConfig;

  constructor(nodePath:string, files:[string], parent?:Node, options?:{}) {
    var parentPath:string;

    if (!parent) {
      parentPath = path.resolve(nodePath, '..');
    } else {
      parentPath = parent.path;
    }

    var nodeName:string = nodePath.slice(parentPath.length + 1);

    this.id = nodeName;
    this.files = files;
    this.path = nodePath;
  }

  resolveComponent():Q.Promise<Node> {
    var d:Q.Deferred<Node> = Q.defer<Node>();

    var componentConfigPath:string = this.files.find((x) => x == 'component.json');

    if (componentConfigPath) {
      // TODO: merge in default configuration
      new Config().load(path.resolve(this.path, componentConfigPath))
      .then((config) => {
        return new Component(config).build();
        // d.resolve(this);
      })
      .catch((e) => {
        console.log("Node.resolveComponent", e);
        d.reject(e);
      });
    } else {
      d.resolve(this);
    };

    return d.promise;
  }

  resolve():Q.Promise<Node> {
    var d:Q.Deferred<Node> = Q.defer<Node>();
    this.resolveComponent()
    .then((node) => {
      d.resolve(node);
    });
    return d.promise;
  }

  public static fromPath(nodePath:string):Q.Promise<Node> {
    var d:Q.Deferred<Node> = Q.defer<Node>();

    Q.nfcall(fs.readdir, nodePath)
    .then((files:[string]) => {
      return new Node(nodePath, files).resolve()
      .then((node) => {
        d.resolve(node);
      });
    })
    .catch((e) => {
      console.log("Node.fromPath:", nodePath, "failed");
      throw(e);
    });

    return d.promise;
  }
}
