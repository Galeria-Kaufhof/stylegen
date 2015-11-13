"use strict";

import {Styleguide} from './Styleguide';
import {Page, IPageConfig} from './Page';
import {IRenderer} from './Renderer';
import {MarkdownRenderer} from './MarkdownRenderer';

export class ContentStructureWriter {
  mdRenderer: IRenderer;
  pages: Page[];

  constructor(private styleguide:Styleguide) {
    this.mdRenderer = new MarkdownRenderer({"htmlEngine": this.styleguide.renderer.engine});
  }

  /**
   * walk config, and build page objects
   */
  walk(content: IPageConfig[]):Promise<ContentStructureWriter> {
    return Promise.all(content.map((pageConfig:IPageConfig) => {
      pageConfig.mdRenderer = this.mdRenderer;
      return new Page(pageConfig).build();
    }))
    .then((pages) => {
      this.pages = pages;
      return this;
    });
  }

  write():Promise<ContentStructureWriter> {
    return new Promise(resolve => resolve(this));
  }
}
