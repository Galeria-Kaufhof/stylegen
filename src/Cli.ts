"use strict";

import * as path from 'path';
import {Styleguide} from './Styleguide';

import {success, error} from './Logger';

interface IResolveOptions {
  prepare?: boolean;
  cwd?: string;
}

function resolveStyleguide(options?:IResolveOptions):Promise<Styleguide> {
  let cwd:string = !!options && !!options.cwd ? options.cwd : process.cwd();

  success('Styleguide.new:' ,'initialize styleguide ...')
  return new Styleguide()
  /**
   * initialize the styleguide with the current working
   * directory of the app and the root of the stylegen tool itself.
   */
  .initialize(cwd, path.resolve(__dirname, '..'))
  /** resolve styleguide structure */
  .then(function(styleguide) {
    success('Styleguide.new:' ,'initialize finished');
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
function build(options?: {}):Promise<Styleguide> {
  var options:{} = Object.assign({}, options);

  return resolveStyleguide(options)
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
function createExport(options?: {}):Promise<Styleguide> {
  var options:{} = Object.assign({}, options, { prepare: false });

  /** we need no styleguide preparation, like asset copying etc. */
  return resolveStyleguide(options)
  .then(function(styleguide) {
    return styleguide.export();
  })
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
      success("Cli.command", "create");
      return build();
    case "export":
      success("Cli.command", "export");
      return createExport();
    default:
      return Promise.reject(new Error("Not the command you are searching for"));
  }
};
