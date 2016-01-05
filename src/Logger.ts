"use strict";

import * as chalk from 'chalk';

export function log(...args: any[]) {
  if (!process.env.MUTE_CLI_LOG) {
    console.log.apply(console, args);
  }
}

export function error(...args: any[]) {
  if (args.length > 1) {
    args[0] = chalk.red(args[0]);
  }

  if (!process.env.MUTE_CLI_LOG) {
    console.error.apply(console, args);
  }
}

export function warn(...args: any[]) {
  if (args.length > 1) {
    args[0] = chalk.yellow(args[0]);
  }

  log.apply(console, args);
}

export function success(...args: any[]) {
  if (args.length > 1) {
    args[0] = chalk.green(args[0]);
  }

  log.apply(console, args);
}
