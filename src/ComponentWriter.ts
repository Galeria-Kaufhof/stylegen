"use strict";

import * as path from 'path';
import * as fs from 'fs';
import * as Q from 'q';
import * as mkdirp from 'mkdirp';

import {Node} from './Node';
import {IRenderer} from './Renderer';
import {Component} from './Component';
import {Styleguide} from './Styleguide';

/**
 * describes an app.component that has been wrapped in the component view,
 * and holds a reference to the Component itself and the compiled output.
 */
interface IViewComponent {
  component: Component;
  compiled?: string;
}

/**
 * The ComponentWriter is dedicated on how to write components
 * to the static file structure of the styleguide.
 *
 * So in here it is declared how components are wrapped into
 * the delivered styleguide components.
 */
export class ComponentWriter {
  /** all nodes of the styleguide */
  nodes: Node[];
  /** template renderer */
  renderer: IRenderer;
  /** backreference to the styleguide */
  styleguide: Styleguide;

  constructor(renderer: IRenderer, nodes: Node[], styleguide: Styleguide ) {
    this.nodes = nodes;
    this.renderer = renderer;
    this.styleguide = styleguide;
  }

  private registerComponents(nodes: Node[]) {
    nodes.forEach((node) => {
      if (node.isComponent()) {
        this.renderer.registerComponent(node.component);
      }

      if (!!node.children) {
        this.registerComponents(node.children);
      }
    });
  }

  buildComponent(component:Component):IViewComponent {
    var viewComponent:IViewComponent = {
      component: component
    };

    if (!!component.view && !!component.view.template) {
      var context = {
        id: component.id,
        headline: component.config.label || component.id,

        // TODO: insert component.context as context
        template: component.view.template({})
      };

      // TODO: handle/secure this law of demeter disaster :D
      var compTemplate = this.styleguide.components['sg.component'].view.template;
      viewComponent.compiled = compTemplate(context);

      return viewComponent;
    } else {
      return null;
    }
  }

  setup():Q.Promise<ComponentWriter> {
    var d:Q.Deferred<ComponentWriter> = Q.defer<ComponentWriter>();

    this.registerComponents(this.nodes)

    d.resolve(this);

    return d.promise;
  }

  /**
   * the most basic writer, that handles the resolution of how to
   * integrated the rendered component views in the target file structure.
   */
  write():Q.Promise<ComponentWriter> {
    var d:Q.Deferred<ComponentWriter> = Q.defer<ComponentWriter>();

    var context:{} = {};
    // TODO: move this clatter to plain component listing method
    try {
      /** get all all components, registered in the styleguide */
      var components:IViewComponent[] = Object.keys(this.styleguide.components)
      .map(key => this.styleguide.components[key])

      /** remove components not element of this styleguide configuration */
      .filter(c => c.config.namespace === this.styleguide.config.namespace)

      /** build the collected IViewComponents */
      .map(component => this.buildComponent(component))

      /** remove components that had no view */
      .filter(c => c !== null);

      /** set context for rendering the component list */
      context = { components: components };

    } catch(e) {
      /** if some of the above fails, go to hell!! :) */
      d.reject(e);
    }

    // TODO: handle/secure this law of demeter disaster :D
    var compListTemplate = this.styleguide.components['sg.layout'].view.template;

    /** shorthand to the styleguide config */
    var config = this.styleguide.config;

    /** creating the target folder path (like mkdir -p), if it doesn't exist */
    Q.nfcall(mkdirp, config.target)

    /** create the plain component list */
    .then(() => Q.nfcall(
      fs.writeFile,
      /** to the target root at the moment */
      path.resolve(config.cwd, config.target, "components.html"),
      /** apply the layout template with the components context */
      compListTemplate(context))
    )
    .then(() => d.resolve(this))
    .catch(e => d.reject(e));

    return d.promise;
  }
}
