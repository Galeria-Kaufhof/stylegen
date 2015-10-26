"use strict";

import * as fs from 'fs';
import * as Q from 'q';

export interface Template {
  path: string;
  raw: string;
  compiled?: string;

  load():Q.Promise<Template>;
}

export interface PartialList {
  [index: number]: Partial;
  map(p:any):any[];
}

export class Partial implements Template {
  raw: string;
  compiled: string;

  constructor(public path: string) {}

  load():Q.Promise<Partial> {
    var d:Q.Deferred<Partial> = Q.defer<Partial>();
    Q.nfcall(fs.readFile, this.path)
    .then((buffer) => {
      var content:string = buffer.toString();
      this.raw = content;
      d.resolve(this);
    });

    return d.promise;
  }
}

export class View implements Template {
  raw: string;
  compiled: string;

  constructor(public path: string) {}

  load():Q.Promise<View> {
    var d:Q.Deferred<View> = Q.defer<View>();
    Q.nfcall(fs.readFile, this.path)
    .then((fileBuffer) => {
      var content:string = fileBuffer.toString();
      this.raw = content;
      d.resolve(this);
    });

    return d.promise;
  }
}
