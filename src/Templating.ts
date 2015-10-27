"use strict";

import * as path from 'path';
import * as fs from 'fs';
import * as Q from 'q';

export interface Template {
  name:string;
  filePath: string;
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
  name: string;

  constructor(public filePath: string) {
    this.name = path.basename(filePath);
  }

  load():Q.Promise<Partial> {
    var d:Q.Deferred<Partial> = Q.defer<Partial>();
    Q.nfcall(fs.readFile, this.filePath)
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
  name: string;

  constructor(public filePath: string) {
    this.name = path.basename(filePath);
  }

  load():Q.Promise<View> {
    var d:Q.Deferred<View> = Q.defer<View>();
    Q.nfcall(fs.readFile, this.filePath)
    .then((fileBuffer) => {
      var content:string = fileBuffer.toString();
      this.raw = content;
      d.resolve(this);
    });

    return d.promise;
  }
}
