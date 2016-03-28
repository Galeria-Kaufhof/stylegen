'use strict'

import * as fs from 'fs-extra'
import * as path from 'path'
import * as denodeify from 'denodeify'
import * as YAML from 'js-yaml'
import { error, log } from './Logger'

let fsreadfile = denodeify(fs.readFile)

/**
 * Config resolver for conveniant merging of configuration options and defaults.
 */
export class Config {

  parseFileContent(filePath, buffer) {
    return new Promise((resolve, reject) => {
      let content

      try {
        if (path.extname(filePath) === '.yml' || path.extname(filePath) === '.yaml') {
          content = YAML.safeLoad(buffer.toString())
        } else {
          content = JSON.parse(buffer.toString())
        }
      } catch (e) {
        error('Config.parseFileContent', `failed to load ${filePath}`)
        log(e.callee, e.stack)
        reject(e)
      }

      resolve(content)
    })
  }

  resolveFile(filePath) {
    return fsreadfile(filePath)
      .then((buffer) => {
        return this.parseFileContent(filePath, buffer)
      })
  }

  /**
   * this is the flesh and bones of the config resolving.
   * If it is a file, load the file, if it is a string containing
   * a json string parse it, and if it is an object it is already fine.
   */
  resolve(path_or_object) {
    let result
    return new Promise((resolve, reject) => {
      if (typeof (path_or_object) == 'object') {
        /** argument is a plain object */
        result = path_or_object
        resolve(result)
      } else if (typeof (path_or_object) == 'string') {
        /** argument is a string, so lets try to figure out what it is */
        try {
          /** lets see if the string contains a json object */
          result = JSON.parse(path_or_object.toString())
          resolve(result)
        } catch (e) {
          /** ok, it may be a file path, so lets resolve the file and return it as json object */
          resolve(this.resolveFile(path_or_object.toString()))
        }
      } else {
        reject('IStyleguideConfig.load: options type not supported, use either object or string (path to a json file or stringified json)')
      }
    })
  }

  /**
   * load supports different setups for configuration setup.
   * You may either pass in a file_path to options or defaults,
   * or the may also be an options hash,
   * or even a string containing json content.
   */
  load(...options) {
    let promises = options.map(x => this.resolve(x)).reverse()
    /** resolve config files */
    return Promise.all(promises)
      .then(function (configs) {
        configs = configs.filter(x => !!x)

        if (configs.length < 1) {
          configs.push({})
        }

        /** return merged configuration */
        let result = Object.assign({}, this, ...configs)
        return result
      })
  }
}
