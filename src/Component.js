'use strict'
import * as path from 'path'
import * as fs from 'fs-extra'
import * as denodeify from 'denodeify'
import * as slug from 'slug'
import * as changeCase from 'change-case'
import { error } from './Logger'
import { Partial } from './Partial'
import { View } from './View'
import { Doc } from './Doc'
import { State } from './State'

let fsreaddir = denodeify(fs.readdir)

/**
 * Components are the representation of the real asset components,
 * that are represented by a component.json file inside of an component folder.
 * A Component has a one-to-one relationship to a Node.
 */
export class Component {
    /**
     * @param config - the parsed component.json file, enriched with current path and namespace.
     */
  constructor(config, node) {
    this.config = config
    this.node = node
    this.id = this.config.id || path.basename(config.path)
    this.slug = `${this.config.namespace}-${this.config.slug || slug(this.id.toLowerCase())}`
    // TODO: this is ugly and error-prone, we should clean this up to a separate property (falk)
    this.id = `${this.config.namespace}.${this.id}`
    this.tags = this.config.tags
    this.path = this.config.namespace !== 'sg' ? this.config.path : this.node.options.styleguide.config.sgTemplateRoot
  }

  /**
   * a component may have several partials, that are component related view snippets,
   * that are reusable by other partials or view components.
   */
  buildPartials() {
    let partialPromises

    if (this.config.partials) {
        /**
         * load all Partials
         */
      partialPromises = this.config.partials.map((partialName) => {
        let p = path.resolve(this.path, partialName)
        return Partial.create(p, this.config.namespace).load()
      })
    } else {
      // TODO: make _partial suffix configurable, along with the other references to it
      partialPromises = this.node.files.filter(x => new RegExp('^.*?_partial.hbs$').test(x)).map((partialName) => {
        let p = path.resolve(this.path, partialName)
        return Partial.create(p, this.config.namespace).load()
      })
    }

    return Promise.all(partialPromises)
      .then((partials) => {
        this.partials = partials
        return this
      })
  }

  /**
   * at the moment a Component can have exactly one view,
   * that is available later as executable js function.
   *
   * A view is not reusable directly in other views,
   * to have a reusable snippet, register a Partial instead.
   */
  buildView() {
    let viewPath

    if (this.config.view) {
      viewPath = path.resolve(this.path, this.config.view)
    } else {
      viewPath = this.node.files.find(x => new RegExp('^view.hbs$').test(x))

      if (!viewPath) {
        return Promise.resolve(this)
      }

      viewPath = path.resolve(this.path, viewPath)
    }

    return View.create(viewPath).load()
      .then((view) => {
        this.view = view
        return this
      })
  }

  /**
   * documents that are named like a component state are bound to that state in case
   * there are no configured docs for the component, so .
   */
  docStateFilter() {
    if (this.config.states) {
      let stateNames = Object.keys(this.config.states)
      return (filename) => {
        let doc = path.basename(filename, '.md')
        let camelized = changeCase.camel(doc)
        let snakish = changeCase.snake(doc)
        let parameterized = changeCase.paramCase(doc)
        if (stateNames.indexOf(doc) >= 0) {
          return false
        }
        if (stateNames.indexOf(camelized) >= 0) {
          return false
        }
        if (stateNames.indexOf(changeCase.snake(doc)) >= 0) {
          return false
        }
        if (stateNames.indexOf(changeCase.paramCase(doc)) >= 0) {
          return false
        }
        if (this.states.find((x) => {
          if (x.doc) {
            let docName = path.basename(x.doc.filePath, '.md')
            return (docName === doc || docName === camelized || docName === snakish || docName === parameterized)
          }
        })) {
          return false
        }
        return true
      }
    }
    // if there are no states just pipe docs through
    return () => {
      return true
    }
  }

  docFiles() {
    let filePromise
    let docNamePattern = /^.*?.md$/
    if (this.config.componentDocs) {
      filePromise = fsreaddir(path.resolve(this.path, this.config.componentDocs))
        .catch(() => {
          return Promise.resolve([])
        })
    } else {
      filePromise = Promise.resolve(this.node.files)
    }

    return filePromise
      .then(files => files.filter(x => docNamePattern.test(x)))
      .then(files => files.sort((a, b) => {
        let aName = path.basename(a)
        let bName = path.basename(b)

        if (aName > bName)
          return 1
        if (aName < bName)
          return -1
        return 0
      }))
  }

  resolveDocs(componentDocFiles) {
    if (this.config.docs) {
      /** in case docs are defined just take those */
      let docs = this.config.docs
      return Object.keys(docs).map((doc) => {
        let p = path.resolve(this.path, this.config.componentDocs || '.', docs[doc])
        /** add partial loading promise to promise collection */
        return Doc.create(p, doc).load()
      })
    } else {
      /**
       * in case no docs are given, lets take all docs inside the component doc directory,
       * that are not related to component states (statename.md)
       */
      let stateFilter = this.docStateFilter()
      return componentDocFiles
        .filter(x => stateFilter(x))
        .map((f) => {
          let docName = path.basename(f, '.md')
          let p = path.resolve(this.path, this.config.componentDocs || '.', f)
          return Doc.create(p, docName).load()
        })
    }
  }

  /**
   * each component may have a map of documents,
   * provided by `id: filepath`.
   */
  buildDocs() {
    return this.docFiles()
      .then((componentDocFiles) => {
        let docPromises = this.resolveDocs(componentDocFiles)
        return Promise.all(docPromises)
          .then((loadedDocs) => {
            this.docs = loadedDocs
            return this
          })
      })
  }

  /**
   * a Component may have several states like disabled, active and so on,
   * while that should be options in a view, you may give each state its own render context,
   * which will be passed to the view.
   *
   * So each state will result in a rendering of the original view, with this specific render context,
   * and its label and the possibility of an additional state document, that describes the "why and what".
   *
   * If any states are given, the original view is not printed. If you want it to, just
   * configure it for example as 'default' state.
   *
   * A state context may be an array of context objects. If so, the state view is rendered multiple times,
   * to give rendering examples of the state in different variants. E.g. take a button, that may be active,
   * and you want to show, how it looks for a button-tag and a link-tag with given classes.
   */
  buildStates() {
    let statePromises
    if (this.config.states) {
      /** prepare states (and especially their docs) */
      statePromises = Object.keys(this.config.states).map((id) => {
        let config = this.config.states[id]
        return new State(id, this, config).load()
      })
    } else {
      statePromises = [Promise.resolve(null)]
    }

    return Promise.all(statePromises)
      .then((loadedStates) => {
        this.states = loadedStates
        return this
      })
  }

  /**
   * building a component means to retrieve the flesh and bones of the component,
   * that are described in its config
   *
   * --> Its Partials, its View, and later all other related stuff.
   */
  build() {
      /** resolve the component partials at first */
    return this.buildPartials()
      .then(() => this.buildView())
      .then(() => this.buildStates())
      .then(() => this.buildDocs())
      .catch(e => {
        error(e)
        error(e.stack)
        throw (e)
      })
  }
}
