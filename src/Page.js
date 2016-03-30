'use strict'

import fs from 'fs-extra'
import path from 'path'
import slug from 'slug'
import denodeify from 'denodeify'
import { Doc } from './Doc'
import { PlainComponentList } from './PlainComponentList'
import { warn, error } from './Logger'

let fsoutputfile = denodeify(fs.outputFile)

export class Page {
  constructor(config, parent) {
    this.config = config
    this.parent = parent
    this.styleguide = this.config.styleguide
    this.mdRenderer = this.config.mdRenderer
    this.label = this.config.label
    this.id = this.config.id || slug(this.config.label.toLowerCase())
    // this.slug = `${this.styleguide.config.namespace}-${this.config.slug || slug(this.id.toLowerCase())}`
    this.slug = this.config.slug || this.id

    if (!parent && this.config.target) {
      this.target = this.config.target
    } else if (parent) {
      this.target = path.resolve(path.dirname(parent.target), parent.slug)
    } else {
      throw ('No target for the styleguide specified')
    }

    this.root = this.styleguide.config.target
    this.cwd = this.target
    // TODO: target should stay the folder, whereas link should be used to reference the file
    this.target = path.resolve(this.target, this.slug + '.html')
    this.link = this.target
    this.styleguide.linkRegistry.add(`page-${this.slug}`, this.link, {
      root: this.root,
      cwd: this.cwd
    })
  }

  resolveChildren() {
    if (this.config.children && this.config.children.length > 0) {
      return Promise.all(this.config.children.map((childPageConfig) => {
        childPageConfig.styleguide = this.styleguide
        return new Page(childPageConfig, this).build()
      }))
        .then(children => {
          this.children = children
          return this
        })
    } else {
      return Promise.resolve(this)
    }
  }

  buildComponentList(options) {
    // options = Object.assign({}, options, { page: this.layoutContext })
    options = Object.assign({}, options)
    return new PlainComponentList(this.styleguide).build(options)
  }

  setupExternalLink(options) {
    this.link = options.link
    this.notRenderable = true
    return Promise.resolve(this)
  }

  buildContent() {
    let contentPromise
    // var docFactory = this.styleguide.docFactory
    try {
      switch (this.config.type) {
      case 'md':
        contentPromise = Doc.create(path.resolve(this.styleguide.config.cwd, this.config.content), this.config.label).load()
          .then((doc) => {
            let ctx = Object.assign({}, this.config, { content: doc.compiled })
            let pageLayout = this.styleguide.components.find('sg.page').view.template
            doc.compiled = pageLayout(ctx)
            return doc
          })
        break
      case 'tags':
        contentPromise = this.buildComponentList({ label: this.label, tags: this.config.content })
        break
      case 'link':
        contentPromise = this.setupExternalLink({ link: this.config.content })
        break
      case 'components':
        if (this.config.preflight) {
          contentPromise = Doc.create(path.resolve(this.styleguide.config.cwd, this.config.preflight), this.config.label)
            .load()
            .then((preflight) => {
              return this.buildComponentList({ label: this.label, components: this.config.content, preflight: preflight.compiled })
            })
        } else {
          contentPromise = this.buildComponentList({ label: this.label, components: this.config.content })
        }
        break
      default:
        /** FOR UNKNOWN TYPES */
        warn('Page.buildContent - config.type unknown', this.config.type)
        contentPromise = Promise.resolve(null)
      }
    } catch (e) {
      return Promise.reject(e)
    }

    return contentPromise.then((content) => {
      if (content !== null) {
        if (content instanceof PlainComponentList) {
          this.componentList = content
        }

        this.content = content
      }

      return this
    })
  }

  build() {
    return this.resolveChildren()
      .then(() => this.buildContent())
      .then(() => this)
  }
  writeChildren(layout, context) {
    if (this.children) {
      return Promise.all(this.children.map((child) => child.write(layout, context)))
        .then(() => this)
    } else {
      return Promise.resolve(this)
    }
  }
  write(layout, context) {
    if (this.notRenderable || !!this.content) {
      let preparation
      let pageContext = Object.assign({}, context)

      /** root and cwd are important properties for the relative link helper we made available in the handlebars engine */
      pageContext.page = this
      pageContext.root = this.root
      pageContext.cwd = this.cwd
      if (this.content instanceof PlainComponentList) {
        preparation = this.componentList.render(pageContext)
          .then((plainComponentList) => {
            pageContext.content = plainComponentList.compiled
          })
      } else {
        pageContext.content = this.content.compiled
        preparation = Promise.resolve(this)
      }

      /** applying here, because of stupid type defintion with multiargs :/ */
      return preparation
        .then(() => {
          return fsoutputfile.apply(this, [this.target, layout(pageContext)])
        })
        .then(() => this.writeChildren(layout, context))
        .then(() => {
          return this
        })
        .catch(e => error('OMG', e.stack))
    } else {
      return Promise.resolve(this)
    }
  }
}
