"use strict";

import * as path from 'path';
import * as Q from 'q';
import {Styleguide} from './Styleguide';
import {IProjectConfig} from './Config';
import {Node} from './Node';

/**
 * The StructureBuilder class serves as orchestrator to our styleguide class,
 * so that we can chain up the necessary steps which fill our styleguide structure appropriatly.
 */
export class StructureBuilder {
  styleguide:Styleguide;

  constructor(styleguide:Styleguide) {
    /** lets hold a reference to the parent styleguide */
    this.styleguide = styleguide;
  }

  /**
   * because all the configured folders and files in the styleguide configuration,
   * are realtive to the current working directory of the user, we need a little helper,
   * to look at the right place.
   */
  fileInCWD(p:string):string {
    return path.resolve(this.styleguide.config["cwd"], p);
  }

  /**
   * Collect all the little things, that represent out styleguide, e.g. components and pages
   */
  collect():Q.Promise<StructureBuilder> {
    var d:Q.Deferred<StructureBuilder> = Q.defer<StructureBuilder>();
    var componentPaths:[string] = this.styleguide.config["componentPaths"];

    /**
     * a node is a sub entry in our component hierarchy, which may be a component or
     * just a category folder (or maybe just empty :/)
     */
    var nodeLookups = componentPaths.map((p) => {
      return new Node(this.fileInCWD(p)).resolve();
    });

    /**
     * Take all the root nodes and look forward to collect components and similar.
     */
    Q.all(nodeLookups)
    .then((nodes) => {
      /** assign nodes to the parent styleguide */
      this.styleguide.nodes = nodes;
      d.resolve(this);
    })
    .catch(e => d.reject(e));

    return d.promise;
  }
};
