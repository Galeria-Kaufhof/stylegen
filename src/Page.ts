"use strict";

import * as fs from 'fs-extra';
import * as path from 'path';
import * as slug from 'slug';
import * as denodeify from 'denodeify';

import {Doc} from './Doc';
import {View} from './View';
import {Styleguide} from './Styleguide';
import {IRenderer} from './Renderer';
import {IPageLayoutContext} from './PageLayout';
import {PlainComponentList} from './PlainComponentList';
import {ICompilableContent} from './CompilableContent';

var fsoutputfile = denodeify(fs.outputFile);

export interface IPageConfig {
  label?: string;
  type?: string;
  content?: any;
  children?: Page[];
  styleguide?: Styleguide;
  mdRenderer?: IRenderer;
  target?: string;
}


export class Page {
  target: string;
  link: string;
  label: string;
  slug: string;
  content: any;
  children: Page[];
  mdRenderer: IRenderer;

  constructor(private config: IPageConfig, private parent?: Page) {
    this.mdRenderer = this.config.mdRenderer;

    this.label = this.config.label;
    this.slug = slug(this.label.toLowerCase());

    if(!parent && this.config.target) {
      this.target = this.config.target;
    } else if(!!parent) {
       this.target = path.resolve(path.dirname(parent.target), parent.slug);
    } else {
      throw("No target for the styleguide specified")
    }

    this.target = path.resolve(this.target, this.slug + '.html');
    this.link = path.resolve("/", path.relative(this.config.styleguide.config.target, this.target));
  }

  resolveChildren():Promise<Page> {
    if (!!this.config.children && this.config.children.length > 0) {
      return Promise.all(this.config.children.map((childPageConfig:IPageConfig) => {
        childPageConfig.styleguide = this.config.styleguide;
        return new Page(childPageConfig, this).build();
      }))
      .then(children => {
        this.children = children;
        return this;
      });
    } else {
      return Promise.resolve(this);
    }
  }

  buildContent():Promise<Page> {
      var contentPromise:Promise<any>;
      // var docFactory = this.config.styleguide.docFactory;
      switch(this.config.type) {
        case "md":
          contentPromise = Doc.create(path.resolve(this.config.content), this.config.label).load()
          .then((doc) => {

            var pageLayout = this.config.styleguide.components.find('sg.page').view.template;
            doc.compiled = pageLayout({content: doc.compiled});

            return doc;
          });
          break;
        case "tags":
          contentPromise = new PlainComponentList(this.config.styleguide).build(this.config.content);
          break;
        default:
          /** FOR UNKNOWN TYPES */
          console.error("Page.buildContent - config.type unknown", this.config.type);
          contentPromise = Promise.resolve(this);

      }

      return contentPromise.then((content: ICompilableContent) => {
        this.content = content.compiled;
        return this;
      });
  }

  build():Promise<Page> {
    return this.resolveChildren()
    .then((page) => this.buildContent())
    .then(() => {return this; });
  }

  writeChildren(layout: Function, context: IPageLayoutContext):Promise<Page> {
    if (!!this.children) {
      return Promise.all(this.children.map((child:Page) => child.write(layout, context)))
      .then(children => this);
    } else {
      return Promise.resolve(this);
    }
  }

  write(layout: Function, context: IPageLayoutContext):Promise<Page> {
    var pageContext:IPageLayoutContext = Object.assign({}, context);
    pageContext.content = this.content;

    /** applying here, because of stupid method defintion with multiargs :/ */

    return fsoutputfile.apply(this, [this.target, layout(pageContext)])
    .then(page => this.writeChildren(layout, context))
    .then((file:any) => this);
  }
}
