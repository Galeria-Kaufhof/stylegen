'use strict'

import * as path from 'path'
import * as denodeify from 'denodeify'
import * as fs from 'fs-extra'
import { success, warn, error, log } from './Logger'
import { Config } from './Config'
import { StructureReader } from './StructureReader'
import { StructureWriter } from './StructureWriter'
import { ComponentList } from './ComponentList'
import { LinkRegistry } from './LinkRegistry'
import { Doc } from './Doc'
import { Partial } from './Partial'
import { View } from './View'
import { MarkdownRenderer } from './MarkdownRenderer'
import { HandlebarsRenderer } from './HandlebarsRenderer'

let fsensuredir = denodeify(fs.ensureDir)
let fscopy = denodeify(fs.copy)
let outputfile = denodeify(fs.outputFile)
let flatten = (list) => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])

export class Styleguide {
  // public docFactory: DocFactory
  constructor(options) {
    this.options = options
    // nodes build the structure of our styleguide
    this.nodes = []
    this.components = new ComponentList()
  }

  /*
   * Styleguide setup method to collect and merge configurations,
   * to set defaults and allow to overwrite them in the styleguide.json
   */
  initialize(cwd, stylegenRoot) {
    return new Promise((resolve, reject) => {
      let configPath

      this.options = this.options ? this.options : {}

      if (!stylegenRoot) {
        stylegenRoot = path.resolve(__dirname, '..')
      }

      if (!!this.options && !!this.options.configPath) {
        configPath = this.options.configPath
      } else {
        let jsonConfig = path.resolve(cwd, 'styleguide.json')
        let yamlConfig = path.resolve(cwd, 'styleguide.yaml')
        let stat

        try {
          stat = fs.statSync(jsonConfig)
        } catch (e) {
          // do nothing
        }

        configPath = stat ? jsonConfig : yamlConfig
      }

      let configurations = [configPath, path.resolve(stylegenRoot, 'styleguide-defaults.yaml')]

      configurations.unshift(this.options)

      /**
       * retrieve the config and bootstrap the styleguide object.
       */
      return new Config()
        .load(...configurations)
        .then((mergedConfig) => {
          this.config = mergedConfig
          /** lets assure, that we have the current working directory in reach for later access */
          this.config.cwd = cwd
          /** we sometimes need the stylegen root, e.g. for file resolvement */
          this.config.stylegenRoot = stylegenRoot
          this.config.componentPaths.push(path.resolve(stylegenRoot, 'styleguide-components'))
          this.config.target = path.resolve(cwd, this.config.target)

          if (!this.config.sgTemplateRoot) {
            this.config.sgTemplateRoot = path.resolve(path.dirname(require.resolve('stylegen-theme-flatwhite')), 'dist')
          }

          /** each and every styleguide should have a name ) */
          if (!this.config.name) {
            this.config.name = path.basename(this.config.cwd)
          }

          if (!this.config.version) {
            this.config.version = '0.0.1'
          }

          let rendererConfig = {}

          rendererConfig.namespace = this.config.namespace

          if (this.config.partials) {
            rendererConfig.partialLibs = this.config.partials.map(p => {
              try {
                let partialLibPath = path.resolve(this.config.cwd, p)

                if (fs.statSync(partialLibPath)) {
                  return require(partialLibPath)
                }
              } catch (e) {
                warn('Styleguide.initialize', 'not existing partial lib referenced')
                return null
              }
            })
          }

          this.htmlRenderer = new HandlebarsRenderer(rendererConfig)
          this.linkRegistry = new LinkRegistry()
          this.docRenderer = new MarkdownRenderer({ 'htmlEngine': this.htmlRenderer, 'linkRegistry': this.linkRegistry })
          Doc.setRenderer(this.docRenderer)
          Partial.setRenderer(this.htmlRenderer)
          View.setRenderer(this.htmlRenderer)
          resolve(this)
        })
        .catch(function (e) {
          error('Styleguide.initialize:', e.message)
          log(e.stack)
          reject(e)
        })
    })
  }

  /*
   * walk the configured styleguide folders and read in the several components, pages, navigation, etc.,
   * and store the information inside the styleguide properties.
   */
  read() {
    /**
     * While this.nodes should represent our styleguide tree strucute, it is empty yet,
     * so lets start to fill it.
     *
     * A successful collect promise just resolves to `this`, so that we are able
     * to proceed with the information we collected in the read step.
     */
    return new StructureReader(this)
      .collect()
      .then(() => {
        return this
      })
  }

  /*
   * write down, what was read, so make sure you read before :)
   */
  write() {
    return new StructureWriter(this.renderer, this.nodes, this)
      .setup()
      .then((structureWriter) => {
        return structureWriter.write()
      })
      .then(() => this)
  }

  /*
   * write down, what was read, so make sure you read before :)
   */
  exportStyleguide() {
    success('Styleguide.export', 'creating export...')

    /* TODO: move to Partial export function */
    let partials = this.components.all()
      .filter((c) => c.config.namespace === this.config.namespace)
      .filter((c) => c.partials.length > 0)
      .map(c => c.partials.map(p => p.registerable))
    partials = flatten(partials)

    let partialsTemplate = `exports.partials = function(engine, atob){
      ${partials.join('\n')}
  }`
    return outputfile(path.resolve('.', 'partials.js'), partialsTemplate)
      .then(() => {
        return Promise.resolve(this)
      })
  }

  /*
   * write down, what was read, so make sure you read before :)
   */
  prepare() {
    return fsensuredir(path.resolve(this.config.cwd, this.config.target, 'assets'))
      .then(() => {
        return fscopy(path.resolve(this.config.sgTemplateRoot, 'stylegen-assets'),
        // TODO: make "assets" path configurable
        path.resolve(this.config.cwd, this.config.target, 'stylegen-assets'))
      })
      .then(() => {
        if (this.config.assets) {
          let copyPromises = this.config.assets.map((asset) => {
            return fscopy(path.resolve(this.config.cwd, asset.src), path.resolve(this.config.cwd, this.config.target, asset.target))
          })

          return Promise.all(copyPromises)
        } else {
          warn('Styleguide.prepare', 'No additional assets configured')

          return Promise.resolve([])
        }
      })
      .then(() => {
        return this
      })
  }
}
