"use strict";

import * as path from 'path';
import {Doc} from './Doc';
import {MarkdownRenderer} from './MarkdownRenderer';
import {Styleguide} from './Styleguide';
import {IRenderer} from './Renderer';

export interface IPageConfig {
  label?: string;
  type?: string;
  content?: string;
  styleguide?: Styleguide;
  mdRenderer?: IRenderer;
  target?: string;
}

export class Page {
  target: string;
  content: string;
  parent: Page;
  children: Page[];
  mdRenderer: IRenderer;

  constructor(private config: IPageConfig, parent?: Page) {
    /** TODO: rotating demeter in his grave, so at least encapsulate the access to the engine */
    this.mdRenderer = this.config.mdRenderer;
    this.target = this.config.target;
  }

  resolveChildren():Promise<Page> {
    if (!!this.children && this.children.length > 0) {
      return Promise.all(this.children.map(childPageConfig => {
        return new Page(childPageConfig, this).build();
      }))
      .then(children => {
        this.children = children;
        return this;
      });
    } else {
      return new Promise((resolve) => resolve(this));
    }
  }

  buildContent():Promise<Page> {
      var contentPromise:Promise<any>;

      switch(this.config.type) {
        case "md":
          contentPromise = new Doc(path.resolve(this.config.content), this.config.label).load()
          .then((doc: Doc) => {
            return this.mdRenderer.render(doc);
          });
          break;
        case "tags":
          // TODO: handle tag pages
        default:
          contentPromise = new Promise((resolve) => resolve(this));

      }

      return contentPromise
      .then((content: string) => {
        this.content = content;
        return this
      });
  }

  build():Promise<Page> {
    return this.resolveChildren()
    .then((page) => this.buildContent())
    .then(() => {return this; });
  }

  write():Promise<Page> {
    return new Promise(resolve => resolve(this));
  }
}
