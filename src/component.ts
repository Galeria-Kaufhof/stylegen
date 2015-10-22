"use strict";

import templating = require('./templating');

interface PartialList {
  [index: number]: templating.Partial;
}

export class Component {
  partials: PartialList;

  constructor() {
    console.log(templating.Partial);
  }
}
