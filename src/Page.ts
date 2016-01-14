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
import {warn} from './Logger';

var fsoutputfile = denodeify(fs.outputFile);

export interface IPageConfig {
  label?: string;
  slug?: string;
  type?: string;
  content?: any;
  children?: Page[];
  styleguide?: Styleguide;
  mdRenderer?: IRenderer;
  target?: string;
  preflight?: string;
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
    this.slug = this.config.slug || slug(this.label.toLowerCase());

    if(!parent && this.config.target) {
      this.target = this.config.target;
    } else if(!!parent) {
       this.target = path.resolve(path.dirname(parent.target), parent.slug);
    } else {
      throw("No target for the styleguide specified")
    }

    this.target = path.resolve(this.target, this.slug + '.html');
    this.link = this.target;
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
          contentPromise = Doc.create(path.resolve(this.config.styleguide.config.cwd, this.config.content), this.config.label).load()
          .then((doc) => {

            var pageLayout = this.config.styleguide.components.find('sg.page').view.template;
            doc.compiled = pageLayout({content: doc.compiled});

            return doc;
          });
          break;
        case "tags":
          contentPromise = new PlainComponentList(this.config.styleguide).build({label: this.label, tags: this.config.content});
          break;
        case "components":
          if (!!this.config.preflight) {
            contentPromise = Doc.create(path.resolve(this.config.styleguide.config.cwd, this.config.preflight), this.config.label)
              .load()
              .then((preflight) => {
                return new PlainComponentList(this.config.styleguide).build({ label: this.label, components: this.config.content, preflight: preflight.compiled });
              });
          } else {
            contentPromise = new PlainComponentList(this.config.styleguide).build({ label: this.label, components: this.config.content});
          }
          break;
        default:
          /** FOR UNKNOWN TYPES */
          warn("Page.buildContent - config.type unknown", this.config.type);
          contentPromise = Promise.resolve(null);

      }

      return contentPromise.then((content: ICompilableContent) => {
        if (content !== null) {
          this.content = content.compiled;
        }

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
    if (!!this.content) {
      var pageContext:IPageLayoutContext = Object.assign({}, context);
      pageContext.content = this.content;
      pageContext.pageroot = this.config.styleguide.config.target;
      pageContext.pagecwd = path.dirname(this.target);

      /** applying here, because of stupid type defintion with multiargs :/ */
      return fsoutputfile.apply(this, [this.target, layout(pageContext)])
      .then(page => this.writeChildren(layout, context))
      .then((file:any) => this);
    } else {
      return Promise.resolve(this);
    }
  }
}
