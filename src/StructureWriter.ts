"use strict";

import * as fs from 'fs-extra';
import * as path from 'path';
import {log, warn, error} from './Logger';
import {Node} from './Node';
import {Styleguide} from './Styleguide';
import {IRenderer} from './Renderer';
import {ComponentRegistry} from './ComponentRegistry';
import {PlainComponentList} from './PlainComponentList';
import {ContentStructureWriter} from './ContentStructureWriter';

/** basic unspecific layout context */
export interface ILayoutContext {
  cssDeps?: string[];
  jsDeps?: string[];
  head?: string[];
  components?: any;
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

      if (!!this.styleguide.config.dependencies) {
        try { layoutContext.cssDeps = this.styleguide.config.dependencies.styles; } catch(e) { /** ok, no style dependencies */ }

        try { layoutContext.jsDeps = this.styleguide.config.dependencies.js; } catch(e) { /** ok, no js dependencies */ }

        if (!!this.styleguide.config.dependencies.templates) {
          if (!!this.styleguide.config.dependencies.templates.head) {
            try {
              layoutContext.head = this.styleguide.config.dependencies.templates.head;

              if (typeof layoutContext.head === "string") {
                layoutContext.head = [layoutContext.head];
              }

              layoutContext.head = layoutContext.head.map(file => fs.readFileSync(path.resolve(this.styleguide.config.cwd, file))).join('\n');
            } catch(e) { warn("StructureWriter.write: dependencies.head", e.message); log(e.stack); }
          }

          if (!!this.styleguide.config.dependencies.templates.bottom) {
            try {
              layoutContext.bottom = this.styleguide.config.dependencies.templates.bottom;

              if (typeof layoutContext.bottom === "string") {
                layoutContext.bottom = [layoutContext.bottom];
              }

              layoutContext.bottom = layoutContext.bottom.map(file => fs.readFileSync(path.resolve(this.styleguide.config.cwd, file))).join('\n');
            } catch(e) { warn("StructureWriter.write: dependencies.bottom", e.message); log(e.stack); }
          }
        }
      }
      if (!!this.styleguide.config.content) {
        type = "content-config";
      }

      var result:Promise<any>;

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
          result = new PlainComponentList(this.styleguide).build()
            .then((plainListWriter:PlainComponentList) => plainListWriter.write(layoutContext));
      }

      return result
      .then(() => resolve(this))
      .catch((e) => reject(e));
    });
  }
}
