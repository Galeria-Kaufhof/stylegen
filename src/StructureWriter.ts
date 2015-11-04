"use strict";

import {Node} from './Node';
import {Styleguide} from './Styleguide';
import {IRenderer} from './Renderer';
import {ComponentRegistry} from './ComponentRegistry';
import {ComponentWriter} from './ComponentWriter';


/**
 * While the StructureReader concentrates on parsing the component directory for its structure
 * and inherent data, the StructureWriter is made for writing the resulting styleguide object down
 * to a target structure.
 */
export class StructureWriter {
  nodes: Node[];
  renderer: IRenderer;
  styleguide: Styleguide;

  constructor(renderer: IRenderer, nodes: Node[], styleguide: Styleguide ) {
    this.nodes = nodes;
    this.renderer = renderer;
    this.styleguide = styleguide;
  }

  /**
   * Lets run through the several setup tasks, that should be done before writing any files.
   * At the moment it is mainly about registering the component templates inside the renderer.
   */
  public setup():Promise<StructureWriter> {
    return new ComponentRegistry(this.renderer, this.nodes).setup()
    .then(componentRegistry => this);
  }

  /**
   * Lets write down Components, Pages, etc.
   */
  public write():Promise<StructureWriter> {
    // TODO: resolve which component-writer from styleguide.config
    return new ComponentWriter('plain', this.nodes, this.styleguide).write()
    .then(componentWriter => this);
  }
}
