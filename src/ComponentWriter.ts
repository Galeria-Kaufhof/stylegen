import * as path from 'path';
import * as fs from 'fs';
import * as Q from 'q';
import {Node} from './Node';
import {IRenderer} from './Renderer';
import {Component} from './Component';
import {Styleguide} from './Styleguide';

export class ComponentWriter {
  nodes: Node[];
  renderer: IRenderer;
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

  buildComponent(component:Component):string {
    if (!!component.view && !!component.view.template) {
      var context = {
        headline: component.id,

        // TODO: insert component.context as context
        template: component.view.template({})
      };

      try {
        var compTemplate = this.styleguide.components['sg.component'].view.template;
      } catch(e) {
        console.log(this.styleguide.components['sg.component']);
      }

      return compTemplate(context);
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

  write():Q.Promise<ComponentWriter> {
    var d:Q.Deferred<ComponentWriter> = Q.defer<ComponentWriter>();

    var components:string[] = Object.keys(this.styleguide.components)
    .map(key => this.styleguide.components[key])
    // TODO: filter for app namespaced components

    .map(component => this.buildComponent(component))
    .filter(c => c !== null);

    var context = { components: components };

    var compListTemplate = this.styleguide.components['sg.layout'].view.template;

    var config = this.styleguide.config;

    Q.nfcall(fs.mkdir, config.target)
    .then(() => Q.nfcall(fs.writeFile, path.resolve(config.cwd, config.target, "components.html"),  compListTemplate(context)))
    .then(() => d.resolve(this))
    .catch(e => d.reject(e));

    // fs.writeFile(path.resolve(config.cwd, config.target, "components.html"), compListTemplate(context), (err) => {
    //   if (!!err) {
    //     d.reject(err);
    //   } else {
    //     d.resolve(this);
    //   }
    // });


    return d.promise;
  }
}
