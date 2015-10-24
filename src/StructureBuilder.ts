import * as path from 'path';
import * as Q from 'q';
import {Styleguide} from './Styleguide';
import {ProjectConfig} from './Config';
import {Node} from './Node';

export class StructureBuilder {
  styleguide:Styleguide;

  constructor(styleguide:Styleguide) {
    this.styleguide = styleguide;
  }

  relativeFile(p:string):string {
    return path.resolve(this.styleguide.config["cwd"], p);
  }

  collect():Q.Promise<{}> {
    var d:Q.Deferred<{}> = Q.defer<{}>();
    var componentPaths:[string] = this.styleguide.config["componentPaths"];

    var nodeLookups = componentPaths.map((p) => {
      return Node.fromPath(this.relativeFile(p));
    });

    Q.all(nodeLookups)
    .then((nodes) => {
      this.styleguide.nodes = nodes;
      d.resolve(this);
    })
    .catch((e) => {
      d.reject(e);
    });

    return d.promise;
  }
};
