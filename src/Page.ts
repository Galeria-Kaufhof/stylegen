"use strict";

import * as fs from 'fs';
import * as path from 'path';
import * as slug from 'slug';
import * as mkdirp from 'mkdirp';
import * as denodeify from 'denodeify';

import {Doc} from './Doc';
import {MarkdownRenderer} from './MarkdownRenderer';
import {Styleguide} from './Styleguide';
import {IRenderer} from './Renderer';
import {IPageLayoutContext} from './PageLayout';

var fswritefile = denodeify(fs.writeFile);
var _mkdirp = denodeify(mkdirp);

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
  label: string;
  slug: string;
  content: string;
  parent: Page;
  children: Page[];
  mdRenderer: IRenderer;

  constructor(private config: IPageConfig, parent?: Page) {
    this.mdRenderer = this.config.mdRenderer;

    this.label = this.config.label;
    this.slug = slug(this.label.toLowerCase());

    if(!parent && this.config.target) {
      this.target = this.config.target;
    } else if(!!parent) {
       this.target = path.dirname(parent.target);
    } else {
      throw("No target for the styleguide specified")
    }

    this.target = path.resolve(this.target, this.slug + '.html');
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

      return contentPromise.then((content: Doc) => {
        this.content = content.compiled;
        return this;
      });
  }

  build():Promise<Page> {
    return this.resolveChildren()
    .then((page) => this.buildContent())
    .then(() => {return this; });
  }

  write(layout: Function, context: IPageLayoutContext):Promise<Page> {
    context.content = this.content;

    /** applying here, because of stupid method defintion with multiargs :/ */
    return _mkdirp(path.dirname(this.target))
    .then(fswritefile.apply(this, [this.target, layout(context)]))
    .then((file:any) => this);
  }
}
