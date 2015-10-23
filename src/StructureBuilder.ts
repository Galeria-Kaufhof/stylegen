import Q = require('q');
import config = require('./Config');

export class StructureBuilder {
  constructor(conf:config.ProjectConfig) {

  }

  collect():Q.Promise<{}> {
    var d:Q.Deferred<{}> = Q.defer<{}>();
    return d.promise;
  }
};
