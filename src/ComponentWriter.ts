"use strict";

import * as denodeify from 'denodeify';

import {Node} from './Node';
import {Component} from './Component';
import {Styleguide} from './Styleguide';


import {PlainComponentListWriter} from './PlainComponentListWriter';


/**
 * The ComponentWriter is dedicated on how to write components
 * to the static file structure of the styleguide.
 *
 * So in here it is declared how components are wrapped into
 * the delivered styleguide components.
 */

export interface IComponentWriter {
  write():Promise<IComponentWriter>;
}

export class ComponentWriter {
  constructor(private type: string, private nodes: Node[], private styleguide: Styleguide) {}

  write():Promise<IComponentWriter> {
    var result:Promise<IComponentWriter>

    switch(this.type) {
      case "plain":
      default:
        result = new PlainComponentListWriter(this.nodes, this.styleguide).write();
    }

    return result;
  }
}
