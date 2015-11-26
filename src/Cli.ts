"use strict";

import * as path from 'path';
import {Styleguide} from './Styleguide';

import {success, error} from './Logger';

interface IResolveOptions {
  prepare: boolean;
}

function resolveStyleguide(options?:IResolveOptions):Promise<Styleguide> {
  return new Styleguide()
  /**
   * initialize the styleguide with the current working
   * directory of the app and the root of the stylegen tool itself.
   */
  .initialize(process.cwd(), path.resolve(__dirname, '..'))
  /** resolve styleguide structure */
  .then(function(styleguide) {
    if (!!options && !!options.prepare) {
      success('Styleguide.prepare:' ,'preparing the styleguide target ...');
      return styleguide.prepare();
    } else {
      return Promise.resolve(styleguide);
    }
  })
  .then(function(styleguide) {
    success('Styleguide.read:' ,'start reading ...');
    return styleguide.read();
  })
  .then(function(styleguide) {
    success('Styleguide.read:' ,'finished reading');
    return Promise.resolve(styleguide);
  });
}

/**
 * create the static styleguide
 */
function build():Promise<Styleguide> {
  return resolveStyleguide()
  /** create static styleguide structure */
  .then(function(styleguide) {
    success('Styleguide.write:' ,'start writing ...');
    return styleguide.write();
  })
  .then(function(styleguide) {
    success('Styleguide.write:' ,'finished writing');
    return styleguide;
  })
  .catch(function(e) {
    error("Cli.build", "failed to build Styleguide", e);
    console.log(e.callee, e.stack);
    throw(e);
  });
};

/**
 * create styleguide partials, and maybe other exports
 */
function createExport():Promise<Styleguide> {
  return resolveStyleguide({ prepare: false })
  .catch(function(e) {
    error("Cli.createExport", "failed to build Styleguide", e);
    console.log(e.callee, e.stack);
    throw(e);
  });
  /** create static styleguide structure */
};

/**
 * resolve commandline arguments and run the appropriate command
 *
 * TODO: manage commandline arguments :)
 * TODO: add argument to clean the dist folder in beforehand
 */
export function command(command:string, args:[string]):Promise<any> {
  switch(command) {
    case "create":
      return build();
    case "export":
      return createExport();
    default:
      return Promise.reject(new Error("Not the command you are searching for"));
  }
};
