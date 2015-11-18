"use strict";
/**
 * Interface that new Renderers should implement.
 * As an example implementation look for the HandlebarsRenderer.
 */
export interface IRenderer {
  engine: any;
  render<T>(object: T): T;
}

/** config for the renderer object */
export interface IRendererOptions {
  namespace?: string;
  htmlEngine?: IRenderer;
}
