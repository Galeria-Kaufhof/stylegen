"use strict";

import * as path from 'path';
import * as denodeify from 'denodeify';
import * as fs from 'fs-extra';

import {error, log} from './Logger';
import {Component} from './Component';
import {Styleguide} from './Styleguide';
import {IComponentWriter, IViewComponent} from './ComponentWriter';
import {IState} from './State';
import {IPageLayoutContext} from './PageLayout';

interface IComponentLayoutContext extends IPageLayoutContext {
  components?: IViewComponent[];
}

interface IBuildConfig {
  label?: string;
  tags?: string[];
  components?: string[];
  preflight?: string;
  // page?: IPageTemplateConfig;
  layoutContext?: IComponentLayoutContext;
}

interface ITemplateState {
  label: string;
  slug: string;
  doc: string;
  content: IViewContent[];
}

interface IComponentTemplateContext {
  id: string;
  headline: string;
  docs: {label: string, content: string}[];
  states?: ITemplateState[];
  template?: IViewContent;
  component: Component;
  page?: IComponentLayoutContext;
}

export interface IRelatedComponentFiles {
  slug: string;
  content: string;
}

interface IViewContent {
  path: string;
  content: string;
}


var fsoutputfile = denodeify(fs.outputFile);

/**
 * describes an app.component that has been wrapped in the component view,
 * and holds a reference to the Component itself and the compiled output.
 */

export class PlainComponentList implements IComponentWriter {
  compiled: string;
  dependendViews: IRelatedComponentFiles[];
  private layoutContext: IComponentLayoutContext;
  private context: IComponentLayoutContext;

  constructor(private styleguide: Styleguide) {
    this.dependendViews = [];
  }

  // TODO: this is redundant logic to the page writing process, we should unify this path lookup
  private relatedViewPath(viewKey: string):string {
    return path.resolve(this.styleguide.config.target, 'preview-files', `${viewKey}.html`);
  }


  private buildStateContext(component: Component, state:IState, baseContext: {}):ITemplateState {
    var stateContent:IViewContent[] = [];
    state.context = [].concat(state.context);

    stateContent = state.context.map((context:IComponentTemplateContext) => {
      let stateContext = Object.assign({}, baseContext, context);
      let renderedView = component.view.template(stateContext);
      this.dependendViews.push({ slug: state.slug, content: renderedView });

      return {
        content: renderedView,
        path: this.relatedViewPath(state.slug)
      };
    });

    return { label: state.label, slug: state.slug, doc: state.doc && state.doc.compiled, content: stateContent };
  }

  private buildComponentTemplateContext(component:Component):IComponentTemplateContext {
    return {
      id: component.slug,
      headline: component.config.label || component.id,
      docs: component.docs.map(d => {
        return { "label": d.name, "content": d.compiled };
      }),
      component: component
    };
  }

  private renderViewComponents(context: IPageLayoutContext):IViewComponent[] {
    var components = context.components;
    var compTemplate = this.styleguide.components.find('sg.component').view.template;

    return components.map((c:IViewComponent) => {
      // console.log(c.component)
      let ctx = Object.assign({}, context, c.componentContext);
      c.compiled = compTemplate(ctx);

      return c;
    });
  }

  /**
   * view component building is the process of wrapping
   * a component inside the styleguides component view,
   * so that we may render it inside a component listing,
   * with the meta information etc. displayed as well,
   * as the compiled component view itself.
   */
  private buildViewComponent(component:Component):IViewComponent {
    var viewComponent:IViewComponent = {
      component: component
    };

    /**
     * If the component has a view, we will render it to the list of components.
     * In case it has no view, we will not display the component for now.
     */
    if (!!component.view && !!component.view.template) {
      var viewContext = component.config.viewContext || {};
      var viewConfig = component.view.config || {};
      var viewBaseContext = Object.assign({}, viewConfig, viewContext);

      // /** build the render context for the current component */
      var context = this.buildComponentTemplateContext(component);

      try {
        if (!component.config.states) {
          let renderedView = component.view.template(viewBaseContext);
          this.dependendViews.push({ slug: `${component.slug}-view`, content: renderedView });
          context.template = {
            content: renderedView,
            path: this.relatedViewPath(`${component.slug}-view`)
          };
        } else {
          context.states = component.states.map(state => this.buildStateContext(component, state, viewBaseContext));
        }
      } catch(e) {
        error("PlainComponentList.buildViewComponent", component.view.filePath);
        error(e);
        error(e.stack);
        throw(e);
      }

      /** build the representation of the current component for the styleguide */
      // viewComponent.compiled = compTemplate(context);

      viewComponent.componentContext = context;
      return viewComponent;
    } else {
      return null;
    }
  }

  private intersect<T>(array1:T[], array2:T[]):T[] {
    if (!array1 || !array2) {
      return [];
    }
    return array1.filter((a:T) => array2.indexOf(a) != -1);
  }




  // for component lists we want to create for each rendered view a separate file,
  // so that we may link it inside of an iFrame.
  private writeDependendViewFiles(context: IPageLayoutContext):Promise<PlainComponentList> {
    let config = this.styleguide.config;
    let rootDirectory = config.target;
    let dependentViewFolder = path.resolve(rootDirectory, 'preview-files');
    let dependendViewTemplate = this.styleguide.components.find('sg.dependend-view-layout').view.template;

    if (this.dependendViews.length > 0) {
      let filePromises = this.dependendViews.map(relatedFile => {
        let ctx = Object.assign({}, context, {content: relatedFile.content});
        return fsoutputfile.apply(this, [ path.resolve(dependentViewFolder, `${relatedFile.slug}.html`), dependendViewTemplate(ctx) ])
      });

      return Promise.all(filePromises).then(() => this)
      .catch(e => error("PlainComponentList.writeDependendViewFiles", e));
    }

    return Promise.resolve(this);
  }


  public build(config:IBuildConfig):Promise<PlainComponentList> {
    config = config || {};

    return new Promise((resolve, reject) => {

      var context:IComponentLayoutContext = Object.assign({}, config);

      try {
        /** get all all components, registered in the styleguide */
        var components:Component[] = this.styleguide.components.all(config && config.components);

        if (!!config.tags) {
          components = components.filter((c:Component) => this.intersect(c.tags, config.tags).length == config.tags.length);
        }

        var componentViews:IViewComponent[] = components

        /** remove components not element of this styleguide configuration */
        .filter((c:Component) => c && c.config && c.config.namespace === this.styleguide.config.namespace)

        /** build the collected IViewComponents */
        .map((c:Component) => this.buildViewComponent(c))

        /** remove components that had no view */
        .filter((c:IViewComponent) => c !== null);

        /** set context for rendering the component list */
        context.components = componentViews;
      } catch(e) {
        /** if some of the above fails, go to hell!! :) */
        return reject(e);
      }

      this.context = context;
      return resolve(this);
    });
  }

  public render(layoutContext: IComponentLayoutContext):Promise<PlainComponentList> {
    this.layoutContext = layoutContext;

    try {
      // TODO: handle/secure this law of demeter disaster :D
      var compListTemplate = this.styleguide.components.find('sg.plain-list-layout').view.template;

      var ctx = Object.assign({}, this.layoutContext, this.context);

      ctx.components = this.renderViewComponents(ctx);

      /** shorthand to the styleguide config */
      this.compiled = compListTemplate(ctx);
      return this.writeDependendViewFiles(ctx);
    } catch(e) {
      return Promise.reject(e);
    }
  }


  /**
   * the most basic writer, that handles the resolution of how to
   * integrated the rendered component views in the target file structure.
   */
  public write(layoutContext?: IComponentLayoutContext):Promise<PlainComponentList> {
    return new Promise((resolve, reject) => {
      var config = this.styleguide.config;

      var layout = this.styleguide.components.find('sg.layout').view.template
      layoutContext = Object.assign({}, layoutContext, {content: this.compiled});


      return fsoutputfile(path.resolve(config.cwd, config.target, "components.html"), layout(layoutContext))
      .then(() => resolve(this))
      .catch((e:Error) => reject(e));
    });
  }
}
