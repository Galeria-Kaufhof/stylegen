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

/**
 * describes an app.component that has been wrapped in the component view,
 * and holds a reference to the Component itself and the compiled output.
 */
export interface IViewComponent {
  component: Component;
  compiled?: string;
}

export interface ILayoutContext {
  components?: IViewComponent[];
  cssDeps?: string[];
  jsDeps?: string[];
}

export class ComponentWriter {
  constructor(private type: string, private styleguide: Styleguide) {}

  /**
   * scheduler to the different ComponentWriters
   */
  write(layoutContext?: ILayoutContext):Promise<IComponentWriter> {
    var result:Promise<IComponentWriter>

    layoutContext = layoutContext || {};

    try { layoutContext.cssDeps = this.styleguide.config.dependencies.styles; } catch(e) { /**  ok, no css deps */ }

    try { layoutContext.jsDeps = this.styleguide.config.dependencies.js; } catch(e) {  /**  ok, no js deps */ }

    switch(this.type) {
      case "tags":
        result = new TagListWriter(this.styleguide).write(layoutContext);
        break;
      case "plain":
      default:
        result = new PlainComponentListWriter(this.styleguide).write(layoutContext);
    }

    return result;
  }
}
