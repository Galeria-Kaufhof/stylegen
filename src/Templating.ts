"use strict";

export interface Template {
  path: string;
  raw: string;
  compiled: string;

  load():boolean;
}

export class Partial implements Template {
  raw: string;
  compiled: string;

  constructor(public path: string) {}

  load() {
    return true;
  }
}

export class View implements Template {
  raw: string;
  compiled: string;

  constructor(public path: string) {}

  load() {
    return true;
  }
}
