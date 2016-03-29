'use strict'
import chalk from 'chalk'

export function log(...args) {
  if (!process.env.MUTE_CLI_LOG) {
    console.log.apply(console, args)
  }
}

export function error(...args) {
  if (args.length > 1) {
    args[0] = chalk.bold.red(args[0])
  }
  if (!process.env.MUTE_CLI_LOG) {
    console.error.apply(console, args)
  }
}

export function warn(...args) {
  if (args.length > 1) {
    args[0] = chalk.bold.yellow(args[0])
  }

  log.apply(console, args)
}

export function success(...args) {
  if (args.length > 1) {
    args[0] = chalk.bold.green(args[0])
  }

  log.apply(console, args)
}
