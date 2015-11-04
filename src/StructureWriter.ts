"use strict";

import {Node} from './Node';
import {Styleguide} from './Styleguide';
import {IRenderer} from './Renderer';
import {ComponentRegistry} from './ComponentRegistry';
import {ComponentWriter} from './ComponentWriter';

export class StructureWriter {
  nodes: Node[];
  renderer: IRenderer;
  styleguide: Styleguide;

  constructor(renderer: IRenderer, nodes: Node[], styleguide: Styleguide ) {
    this.nodes = nodes;
    this.renderer = renderer;
    this.styleguide = styleguide;
  }

  public setup():Promise<StructureWriter> {
    // TODO: resolve which component-writer from styleguide.config
    return new ComponentRegistry(this.renderer, this.nodes).setup()
    .then(componentRegistry => this);
  }

  public write():Promise<StructureWriter> {
    return new ComponentWriter('plain', this.nodes, this.styleguide).write()
    .then(componentWriter => this);
  }
}
