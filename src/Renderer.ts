"use strict";

/**
 * Interface that new Renderers should implement.
 * As an example implementation look for the HandlebarsRenderer.
 */
export interface IRenderer {
  setEngine<T>(engine: T): IRenderer;
  render(component: Component): Component;
}

/** config for the renderer object */
export interface IRendererOptions {
  namespace?: string;
}
