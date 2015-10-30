import * as Q from 'q';
import {Node} from './Node';
import {IRenderer} from './Renderer';

export class ComponentWriter {
  nodes: Node[];
  renderer: IRenderer;

  constructor(renderer: IRenderer, nodes: Node[]) {
    this.nodes = nodes;
    this.renderer = renderer;
  }

  private registerComponents(nodes: Node[]) {
    nodes.forEach((node) => {
      this.renderer.registerComponent(node);

      if (!!node.children) {
        this.registerComponents(node.children);
      }
    });
  }

  setup():Q.Promise<ComponentWriter> {
    var d:Q.Deferred<ComponentWriter> = Q.defer<ComponentWriter>();

    this.registerComponents(this.nodes);
    d.resolve(this);

    return d.promise;
  }
}
