'use strict'
import { Styleguide } from './Styleguide'
import { success, error } from './Logger'

/**
 * initialize the styleguide, by reading its configuration and preprare any necessary target structure
 */
function setupStyleguide(options) {
  let cwd = !!options && !!options.cwd ? options.cwd : process.cwd()
  success('Styleguide.new:', 'initialize styleguide ...')
  return new Styleguide()
    .initialize(cwd)
    .then(function (styleguide) {
      success('Styleguide.new:', 'initialize finished')
      if (!options || !options.prepare) {
        success('Styleguide.prepare:', 'preparing the styleguide target ...')
        return styleguide.prepare()
      } else {
        return Promise.resolve(styleguide)
      }
    })
}

/**
 * reading in the actual styleguide content, components and pages
 */
function resolveStyleguide(options) {
  return setupStyleguide(options)
  .then(function (styleguide) {
    success('Styleguide.read:', 'start reading ...')
    return styleguide.read()
  })
  .then(function (styleguide) {
    success('Styleguide.read:', 'finished reading')
    return Promise.resolve(styleguide)
  })
}

/**
 * create the static styleguide
 */
function build(options) {
  options = Object.assign({}, options)

  return resolveStyleguide(options)
  .then(function (styleguide) {
    success('Styleguide.write:', 'start writing ...')
    return styleguide.write()
  })
  .then(function (styleguide) {
    success('Styleguide.write:', 'finished writing')
    return styleguide
  })
  .catch(function (e) {
    error('Cli.build', 'failed to build Styleguide', e)
    throw (e)
  })
}

/**
 * create styleguide partials, and maybe other exports
 */
function createExport(options) {
  options = Object.assign({}, options, { prepare: false })

  /** we need no styleguide preparation, like asset copying etc. */
  return resolveStyleguide(options)
  .then(function (styleguide) {
    return styleguide.exportStyleguide()
  })
  .catch(function (e) {
    error('Cli.createExport', 'failed to build Styleguide', e)
    throw (e)
  })
    /** create static styleguide structure */
}

/**
 * resolve commandline arguments and run the appropriate command
 *
 * TODO: add argument to clean the dist folder in beforehand
 */
export function command(command) {
  switch (command) {
  case 'create':
    success('Cli.command', 'create')
    return build()
  case 'export':
    success('Cli.command', 'export')
    return createExport()
  default:
    return Promise.reject(new Error('Not the command you are searching for'))
  }
}
