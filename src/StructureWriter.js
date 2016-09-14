'use strict'

import fs from 'fs-extra'
import path from 'path'
import { log, warn } from './Logger'
import { PlainComponentList } from './PlainComponentList'
import { ContentStructureWriter } from './ContentStructureWriter'

/**
 * While the StructureReader concentrates on parsing the component directory for its structure
 * and inherent data, the StructureWriter is made for writing the resulting styleguide object down
 * to a target structure.
 */
export class StructureWriter {
  constructor(renderer, nodes, styleguide) {
    this.nodes = nodes
    this.renderer = renderer
    this.styleguide = styleguide
  }

  /**
   * Lets run through the several setup tasks, that should be done before writing any files.
   * At the moment it is mainly about registering the component templates inside the renderer.
   */
  setup() {
    return Promise.resolve(this)
  }

  /**
   * Lets write down Components, Pages, etc.
   */
  write() {
    return new Promise((resolve, reject) => {
      let layoutContext = {
        projectName: this.styleguide.config.name
      }

      let type = 'plain'

      if(this.styleguide.config.assetHost) {
        try {
          layoutContext.assetHost = this.styleguide.config.assetHost
        } catch (e) {
          // do nothing
        }
      }

      if (this.styleguide.config.dependencies) {
        try {
          layoutContext.cssDeps = this.styleguide.config.dependencies.styles
        } catch (e) {
          // do nothing
        }

        try {
          layoutContext.jsDeps = this.styleguide.config.dependencies.js
        } catch (e) {
          // do nothing
        }

        if(this.styleguide.config.themes && this.styleguide.config.themes.length > 0 &&
           !!this.styleguide.config.themes[0].name && !!this.styleguide.config.themes[0].src) {
          try {
            layoutContext.themes = this.styleguide.config.themes
          } catch (e) {
            // do nothing
          }
        }

        if (this.styleguide.config.dependencies.templates) {
          if (this.styleguide.config.dependencies.templates.head) {
            try {
              layoutContext.head = this.styleguide.config.dependencies.templates.head

              if (typeof layoutContext.head === 'string') {
                layoutContext.head = [layoutContext.head]
              }

              layoutContext.head = layoutContext.head.map(file => fs.readFileSync(path.resolve(this.styleguide.config.cwd, file))).join('\n')
            } catch (e) {
              warn('StructureWriter.write: dependencies.head', e.message)
              log(e.stack)
            }
          }

          if (this.styleguide.config.dependencies.templates.bottom) {
            try {
              layoutContext.bottom = this.styleguide.config.dependencies.templates.bottom

              if (typeof layoutContext.bottom === 'string') {
                layoutContext.bottom = [layoutContext.bottom]
              }

              layoutContext.bottom = layoutContext.bottom.map(file => fs.readFileSync(path.resolve(this.styleguide.config.cwd, file))).join('\n')
            } catch (e) {
              warn('StructureWriter.write: dependencies.bottom', e.message)
              log(e.stack)
            }
          }
        }
      }

      if (this.styleguide.config.content) {
        type = 'content-config'
      }

      let result

      switch (type) {
      case 'content-config':
        /** walk config, and build page objects */
        result = new ContentStructureWriter(this.styleguide)
            .walk(this.styleguide.config.content)
            .then(contentStructureWriter => contentStructureWriter.write(layoutContext))
        break
      case 'plain':
      default:
        result = new PlainComponentList(this.styleguide).build()
          .then((plainListWriter) => plainListWriter.write(layoutContext))
      }

      return result
        .then(() => resolve(this))
        .catch((e) => reject(e))
    })
  }
}
