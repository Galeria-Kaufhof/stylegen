'use strict'
import path from 'path'
import denodeify from 'denodeify'
import fs from 'fs-extra'
import { error } from './Logger'

let fsoutputfile = denodeify(fs.outputFile)

/**
 * describes an app.component that has been wrapped in the component view,
 * and holds a reference to the Component itself and the compiled output.
 */
export class PlainComponentList {
  constructor(styleguide) {
    this.styleguide = styleguide
    this.dependendViews = []
  }

  // TODO: this is redundant logic to the page writing process, we should unify this path lookup
  relatedViewPath(viewKey) {
    return path.resolve(this.styleguide.config.target, 'preview-files', `${viewKey}.html`)
  }

  buildStateContext(component, state, baseContext) {
    let stateContent = []

    state.context = [].concat(state.context)

    stateContent = state.context.map((context, index) => {
      let stateContext = Object.assign({}, baseContext, context)
      let renderedView = component.view.template(stateContext)
      this.dependendViews.push({ slug: `${state.slug}-${index}`, content: renderedView })
      return {
        content: renderedView,
        path: this.relatedViewPath(`${state.slug}-${index}`)
      }
    })

    return { label: state.label, slug: state.slug, doc: state.doc && state.doc.compiled, content: stateContent }
  }

  buildComponentTemplateContext(component) {
    return {
      id: component.slug,
      headline: component.config.label || component.id,
      docs: component.docs.map(d => {
        return { 'label': d.name, 'content': d.compiled }
      }),
      component: component
    }
  }

  renderViewComponents(context) {
    let components = context.components
    let compTemplate = this.styleguide.components.find('sg.component').view.template

    return components.map((c) => {
      let ctx = Object.assign({}, context, c.componentContext)
      c.compiled = compTemplate(ctx)
      return c
    })
  }

  /**
   * view component building is the process of wrapping
   * a component inside the styleguides component view,
   * so that we may render it inside a component listing,
   * with the meta information etc. displayed as well,
   * as the compiled component view itself.
   */
  buildViewComponent(component) {
    let viewComponent = {
      component: component
    }

    /**
     * If the component has a view, we will render it to the list of components.
     * In case it has no view, we will not display the component for now.
     */
    if (component.view && component.view.template) {
      let viewContext = component.config.viewContext || {}
      let viewConfig = component.view.config || {}
      let viewBaseContext = Object.assign({}, viewConfig, viewContext)
      // /** build the render context for the current component */
      let context = this.buildComponentTemplateContext(component)

      try {
        if (!component.config.states) {
          let renderedView = component.view.template(viewBaseContext)
          this.dependendViews.push({ slug: `${component.slug}-view`, content: renderedView })
          context.template = {
            content: renderedView,
            path: this.relatedViewPath(`${component.slug}-view`)
          }
        } else {
          context.states = component.states.map(state => this.buildStateContext(component, state, viewBaseContext))
        }
      } catch (e) {
        error('PlainComponentList.buildViewComponent', component.view.filePath)
        error(e)
        error(e.stack)
        throw (e)
      }
      /** build the representation of the current component for the styleguide */
      // viewComponent.compiled = compTemplate(context)
      viewComponent.componentContext = context

      return viewComponent
    } else {
      return null
    }
  }
  intersect(array1, array2) {
    if (!array1 || !array2) {
      return []
    }

    return array1.filter((a) => array2.indexOf(a) != -1)
  }
  // for component lists we want to create for each rendered view a separate file,
  // so that we may link it inside of an iFrame.
  writeDependendViewFiles(context) {
    let config = this.styleguide.config
    let rootDirectory = config.target
    let dependentViewFolder = path.resolve(rootDirectory, 'preview-files')
    let dependendViewTemplate = this.styleguide.components.find('sg.dependend-view-layout').view.template

    if (this.dependendViews.length > 0) {
      let filePromises = this.dependendViews.map(relatedFile => {
        let ctx = Object.assign({}, context, { content: relatedFile.content })
        return fsoutputfile.apply(this, [path.resolve(dependentViewFolder, `${relatedFile.slug}.html`), dependendViewTemplate(ctx)])
      })

      return Promise.all(filePromises).then(() => this)
        .catch(e => error('PlainComponentList.writeDependendViewFiles', e))
    }
    return Promise.resolve(this)
  }
  build(config) {
    config = config || {}
    return new Promise((resolve, reject) => {
      let context = Object.assign({}, config)

      try {
        /** get all all components, registered in the styleguide */
        let components = this.styleguide.components.all(config && config.components)

        if (config.tags) {
          components = components.filter((c) => this.intersect(c.tags, config.tags).length == config.tags.length)
        }

        let componentViews = components
          .filter((c) => c && c.config && c.config.namespace === this.styleguide.config.namespace)
          .map((c) => this.buildViewComponent(c))
          .filter((c) => c !== null)

        /** set context for rendering the component list */
        context.components = componentViews
      } catch (e) {
        /** if some of the above fails, go to hell!! :) */
        return reject(e)
      }

      this.context = context
      return resolve(this)
    })
  }
  render(layoutContext) {
    this.layoutContext = layoutContext

    try {
      // TODO: handle/secure this law of demeter disaster :D
      let compListTemplate = this.styleguide.components.find('sg.plain-list-layout').view.template
      let ctx = Object.assign({}, this.layoutContext, this.context)

      ctx.components = this.renderViewComponents(ctx)
      /** shorthand to the styleguide config */
      this.compiled = compListTemplate(ctx)
      return this.writeDependendViewFiles(ctx)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  /**
   * the most basic writer, that handles the resolution of how to
   * integrated the rendered component views in the target file structure.
   */
  write(layoutContext) {
    return new Promise((resolve, reject) => {
      let config = this.styleguide.config
      let layout = this.styleguide.components.find('sg.layout').view.template

      layoutContext = Object.assign({}, layoutContext, { content: this.compiled })

      return fsoutputfile(path.resolve(config.cwd, config.target, 'components.html'), layout(layoutContext))
        .then(() => resolve(this))
        .catch((e) => reject(e))
    })
  }
}
