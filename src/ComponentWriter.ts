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

  buildComponentBlock(component:Component) {
    var context = {
      headline: "Fubar Headline",

      // TODO: insert component.context as context
      template: component.view.template({})
    }
    var compTemplate = this.styleguide.components['sg.styleguide-component'].view.template;

    console.log(compTemplate(context));
    // var view:string = component.view.template({name:"Fubar"});
    // var template:string = "{{#> app.component }}" + view + "{{/app.component}}";
    // console.log(this.renderer.engine.partials['app.component']);
    // var c = this.renderer.engine.compile(template);
    // console.log(c({}));
  }

  setup():Q.Promise<ComponentWriter> {
    var d:Q.Deferred<ComponentWriter> = Q.defer<ComponentWriter>();

    this.registerComponents(this.nodes)

    d.resolve(this);

    return d.promise;
  }

  write():Q.Promise<ComponentWriter> {
    var d:Q.Deferred<ComponentWriter> = Q.defer<ComponentWriter>();

    this.buildComponentBlock(this.nodes[0].component);

    d.resolve(this);

    return d.promise;
  }
}
