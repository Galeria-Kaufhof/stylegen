import * as fs from 'fs';
import * as Q from 'q';
import {Styleguide} from './Styleguide';
import {ProjectConfig} from './Config';

export class StructureBuilder {
  styleguide:Styleguide;

  constructor(styleguide:Styleguide) {
    this.styleguide = styleguide;
  }

  collect():Q.Promise<{}> {
    var d:Q.Deferred<{}> = Q.defer<{}>();
    var componentPaths:[string] = this.styleguide.config["componentPaths"];

    componentPaths.map(function(path) {
      Q.nfcall(fs.readdir, path, (files:[string]) => {

      });
    });
    d.resolve({});
    return d.promise;
  }
};
