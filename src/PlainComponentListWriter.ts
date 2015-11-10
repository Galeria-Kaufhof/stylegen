"use strict";

import * as path from 'path';
import * as fs from 'fs';
import * as denodeify from 'denodeify';
import * as mkdirp from 'mkdirp';

import {Node} from './Node';
import {Component} from './Component';
import {Styleguide} from './Styleguide';
import {IComponentWriter} from './ComponentWriter';


var _mkdirp = denodeify(mkdirp);
var fswritefile = denodeify(fs.writeFile);

/**
 * describes an app.component that has been wrapped in the component view,
 * and holds a reference to the Component itself and the compiled output.
 */
interface IViewComponent {
  component: Component;
  compiled?: string;
}

export class PlainComponentListWriter implements IComponentWriter {
  constructor(private nodes: Node[], private styleguide: Styleguide) {
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
      /** build the render context for the current component */
      var context = {
        id: component.slug,
        headline: component.config.label || component.id,

        // TODO: insert component.context as context
        template: component.view.template({}),
        docs: component.docs.map(d => {
          return { "label": d.name, "content": d.compiled };
        }),
        component: component
      };

      /** lookup the styleguide component template */
      // TODO: handle/secure this law of demeter disaster :D
      var compTemplate = this.styleguide.components.find('sg.plain-list-component').view.template;

      /** build the representation of the current component for the styleguide */
      viewComponent.compiled = compTemplate(context);

      return viewComponent;
    } else {
      return null;
    }
  }

  /**
   * the most basic writer, that handles the resolution of how to
   * integrated the rendered component views in the target file structure.
   */
  public write():Promise<PlainComponentListWriter> {
    return new Promise((resolve, reject) => {

      var context:{} = {};
      // TODO: move this clatter to plain component listing method
      try {
        /** get all all components, registered in the styleguide */
        var components:IViewComponent[] = this.styleguide.components.keys()
        .map(key => this.styleguide.components.find(key))

        /** remove components not element of this styleguide configuration */
        .filter(c => c.config.namespace === this.styleguide.config.namespace)

        /** build the collected IViewComponents */
        .map(component => this.buildViewComponent(component))

        /** remove components that had no view */
        .filter(c => c !== null);

        /** set context for rendering the component list */
        context = { components: components };

      } catch(e) {
        /** if some of the above fails, go to hell!! :) */
        reject(e);
      }

      // TODO: handle/secure this law of demeter disaster :D
      var compListTemplate = this.styleguide.components.find('sg.plain-list-layout').view.template;

      /** shorthand to the styleguide config */
      var config = this.styleguide.config;

      /** creating the target folder path (like mkdir -p), if it doesn't exist */
      _mkdirp(config.target.toString())

      /** create the plain component list */
      .then(() => {
        /** applying here, because of stupid method defintion with multiargs :/ */
        return fswritefile.apply(this, [path.resolve(config.cwd, config.target, "components.html"), compListTemplate(context)]);
      })
      .then(() => resolve(this))
      .catch((e:Error) => reject(e));

    });
  }
}
