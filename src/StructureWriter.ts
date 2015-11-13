"use strict";

import {Node} from './Node';
import {Styleguide} from './Styleguide';
import {IRenderer} from './Renderer';
import {ComponentRegistry} from './ComponentRegistry';
import {PlainComponentListWriter} from './PlainComponentListWriter';
import {ContentStructureWriter} from './ContentStructureWriter';

/** basic unspecific layout context */
interface ILayoutContext {
  cssDeps?: string[];
  jsDeps?: string[];
}


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
    return new Promise<StructureWriter>((resolve, reject) => {
      var layoutContext:ILayoutContext = {};
      var type:string = 'plain';

      try { layoutContext.cssDeps = this.styleguide.config.dependencies.styles; } catch(e) { /**  ok, no css deps */ }

      try { layoutContext.jsDeps = this.styleguide.config.dependencies.js; } catch(e) {  /**  ok, no js deps */ }

      if (!!this.styleguide.config.content) {
        type = "content-config";
      }
      var result:Promise<any>;

      /**
       * https://github.com/TypeStrong/atom-typescript/issues/719
       */
      !!ContentStructureWriter;

      switch(type) {
        case "content-config":
          /** walk config, and build page objects */
          result = new ContentStructureWriter(this.styleguide)
          .walk(this.styleguide.config.content)

          /** render page objects to file struture (with layout and context inclusively navigation) */
          .then(contentStructureWriter => contentStructureWriter.write(layoutContext));
          break;
        case "plain":
        default:
          result = new PlainComponentListWriter(this.styleguide).write(layoutContext);
      }

      result
      .then(() => resolve(this))
      .catch((e) => reject(e));
    });
  }
}
