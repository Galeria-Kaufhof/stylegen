"use strict";

import * as path from 'path';
import * as denodeify from 'denodeify';
import * as fs from 'fs-extra';

import {error} from './Logger';
import {Component} from './Component';
import {Styleguide} from './Styleguide';
import {IComponentWriter, IViewComponent} from './ComponentWriter';
import {IState} from './State';

interface IComponentLayoutContext {
  components?: IViewComponent[];
  cssDeps?: string[];
  jsDeps?: string[];
}

interface IBuildConfig {
  label?: string;
  tags?: string[];
  components?: string[];
  preflight?: string;
}

interface ITemplateState {
  label: string;
  slug: string;
  doc: string;
  content: string[];
}

interface IComponentTemplateContext {
  id: string;
  headline: string;
  docs: {label: string, content: string}[];
  states?: ITemplateState[];
  template?: string;
  component: Component;
}


var fsoutputfile = denodeify(fs.outputFile);

/**
 * describes an app.component that has been wrapped in the component view,
 * and holds a reference to the Component itself and the compiled output.
 */

export class PlainComponentList implements IComponentWriter {
  compiled: string;
  constructor(private styleguide: Styleguide) {}

  private buildStateContext(component: Component, state:IState, baseContext: {}):ITemplateState {
    var stateContent:string[] = [];
    state.context = [].concat(state.context);

    stateContent = state.context.map((context:IComponentTemplateContext) => {
      let stateContext = Object.assign({}, baseContext, context);
      return component.view.template(stateContext);
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

      /** build the render context for the current component */
      var context = this.buildComponentTemplateContext(component);

      try {
        if (!component.config.states) {
          context.template = component.view.template(viewBaseContext);
        } else {
          context.states = component.states.map(state => this.buildStateContext(component, state, viewBaseContext));
        }
      } catch(e) {
        error("PlainComponentList.buildViewComponent", component.view.filePath);
        error(e);
        error(e.stack);
        throw(e);
      }

      /** lookup the styleguide component template */
      // TODO: handle/secure this law of demeter disaster :D
      var compTemplate = this.styleguide.components.find('sg.component').view.template;

      /** build the representation of the current component for the styleguide */
      viewComponent.compiled = compTemplate(context);

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

  public build(config:IBuildConfig):Promise<IComponentWriter> {
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

      // TODO: handle/secure this law of demeter disaster :D
      var compListTemplate = this.styleguide.components.find('sg.plain-list-layout').view.template;

      /** shorthand to the styleguide config */
      this.compiled = compListTemplate(context);
      return resolve(this);
    });
  }

  /**
   * the most basic writer, that handles the resolution of how to
   * integrated the rendered component views in the target file structure.
   */
  public write(layoutContext?: IComponentLayoutContext):Promise<IComponentWriter> {
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
