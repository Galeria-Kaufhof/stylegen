"use strict";

require('unicorn').install();

export function warn(...args: any[]) {
  if (args.length > 1) {
    args[0] = args[0].yellow();
  }

  console.log.apply(console, args);
}

export function error(...args: any[]) {
  if (args.length > 1) {
    args[0] = args[0].red();
  }

  console.error.apply(console, args);
}

export function success(...args: any[]) {
  if (args.length > 1) {
    args[0] = args[0].green();
  }

  console.log.apply(console, args);
}
