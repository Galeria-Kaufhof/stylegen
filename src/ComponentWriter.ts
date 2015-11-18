"use strict";

import {Component} from './Component';

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
