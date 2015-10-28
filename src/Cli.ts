"use strict";

import * as path from 'path';
import {Styleguide} from './Styleguide';

export function build() {
  new Styleguide()
  .initialize(process.cwd(), path.resolve(__dirname, '..'))
  .then(function(styleguide) {
    return styleguide.read();
  })
  .then(function(styleguide) {
    return styleguide.write();
  })
  .then(function(styleguide) {
    console.log("\n\nREAD FINISHED:\n");
    // console.log(styleguide);
  })
  .catch(function(e) {
    console.log(e.stack);
    throw(e);
  });
};

export function command(args:[string]) {
  build();
};
