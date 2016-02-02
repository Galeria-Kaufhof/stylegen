"use strict";

import {Styleguide} from './Styleguide';
import {Page, IPageConfig} from './Page';
import {IPageLayoutContext} from './PageLayout';

/**
 * This is the writer implementation that jumps into place,
 * when there is a "content"-Property configured in the styleguide.
 */
export class ContentStructureWriter {
  pages: Page[];

  constructor(private styleguide:Styleguide) {
  }

  /**
   * walk config, and build page objects
   *
   * Child page objects are initialized directly inside the Page class.
   */
  walk(content: IPageConfig[]):Promise<ContentStructureWriter> {
    return Promise.all(content.map((pageConfig:IPageConfig) => {
      pageConfig.styleguide = this.styleguide;
      pageConfig.target = this.styleguide.config.target;

      return new Page(pageConfig).build();
    }))
    .then((pages) => {
      this.pages = pages;
      return this;
    });
  }

  /**
   * lookup the page layout and render the page objects each wrapped inside of it.
   */
  write(context: IPageLayoutContext):Promise<ContentStructureWriter> {
    context.pages = this.pages;

    var layout = this.styleguide.components.find('sg.layout').view.template;

    return Promise.all(this.pages.map(page => page.write(layout, context)))
    .then(pages => this);
  }
}
