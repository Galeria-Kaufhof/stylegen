import * as Q from 'q';
import {ProjectConfig} from './Config';

export class StructureBuilder {
  constructor(conf:ProjectConfig) {

  }

  collect():Q.Promise<{}> {
    var d:Q.Deferred<{}> = Q.defer<{}>();
    return d.promise;
  }
};
