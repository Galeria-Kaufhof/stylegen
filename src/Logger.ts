"use strict";

require('unicorn').install();

export function log(...args: any[]) {
  if (!process.env.MUTE_CLI_LOG) {
    console.log.apply(console, args);
  }
}

export function error(...args: any[]) {
  if (args.length > 1) {
    args[0] = args[0].red();
  }

  if (!process.env.MUTE_CLI_LOG) {
    console.error.apply(console, args);
  }
}

export function warn(...args: any[]) {
  if (args.length > 1) {
    args[0] = args[0].yellow();
  }

  log.apply(console, args);
}

export function success(...args: any[]) {
  if (args.length > 1) {
    args[0] = args[0].green();
  }

  log.apply(console, args);
}
