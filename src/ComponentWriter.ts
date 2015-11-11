"use strict";

import * as denodeify from 'denodeify';

import {Node} from './Node';
import {Component} from './Component';
import {Styleguide} from './Styleguide';


import {PlainComponentListWriter} from './PlainComponentListWriter';
import {TagListWriter} from './TagListWriter';


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
  constructor(private type: string, private styleguide: Styleguide) {}

  /**
   * scheduler to the different ComponentWriters
   */
  write():Promise<IComponentWriter> {
    var result:Promise<IComponentWriter>

    switch(this.type) {
      case "tags":
        result = new TagListWriter(this.styleguide).write();
        break;
      case "plain":
      default:
        result = new PlainComponentListWriter(this.styleguide).write();
    }

    return result;
  }
}
