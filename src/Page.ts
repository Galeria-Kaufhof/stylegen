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
import {PlainComponentList, IRelatedComponentFiles} from './PlainComponentList';
import {ICompilableContent} from './CompilableContent';
import {warn, error} from './Logger';

var fsoutputfile = denodeify(fs.outputFile);

export interface IPageConfig {
  id?: string;
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

export interface IPageTemplateConfig {
  root?: string;
  cwd?: string;
}

interface IPlainComponentListBuildOptions {
  label: string;
  tags?: string[];
  components?: string[];
  preflight?: string;
}

export class Page {
  id: string;
  target: string;
  link: string;
  label: string;
  slug: string;
  content: any;
  children: Page[];
  mdRenderer: IRenderer;
  styleguide: Styleguide;
  private root: string;
  private cwd: string;
  private componentList: PlainComponentList;
  private notRenderable: boolean;

  constructor(private config: IPageConfig, private parent?: Page) {
    this.styleguide = this.config.styleguide;

    this.mdRenderer = this.config.mdRenderer;
    this.label = this.config.label;
    this.id = this.config.id || slug(this.config.label.toLowerCase());
    // this.slug = `${this.styleguide.config.namespace}-${this.config.slug || slug(this.id.toLowerCase())}`;
    this.slug = this.config.slug || this.id;

    if(!parent && this.config.target) {
      this.target = this.config.target;
    } else if(!!parent) {
       this.target = path.resolve(path.dirname(parent.target), parent.slug);
    } else {
      throw("No target for the styleguide specified")
    }

    this.root = this.styleguide.config.target;
    this.cwd = this.target;

    // TODO: target should stay the folder, whereas link should be used to reference the file
    this.target = path.resolve(this.target, this.slug + '.html');
    this.link = this.target;

    this.styleguide.linkRegistry.add(`page-${this.slug}`, this.link, {
      root: this.root,
      cwd: this.cwd
    });
  }

  resolveChildren():Promise<Page> {
    if (!!this.config.children && this.config.children.length > 0) {
      return Promise.all(this.config.children.map((childPageConfig:IPageConfig) => {
        childPageConfig.styleguide = this.styleguide;
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

  private buildComponentList(options: IPlainComponentListBuildOptions):Promise<PlainComponentList> {
    // options = Object.assign({}, options, { page: this.layoutContext });
    options = Object.assign({}, options);
    return new PlainComponentList(this.styleguide).build(options);
  }

  private setupExternalLink(options: {link:string;}):Promise<Page> {
    this.link = options.link;
    this.notRenderable = true;
    return Promise.resolve(this);
  }

  buildContent():Promise<Page> {
    var contentPromise:Promise<any>;
    // var docFactory = this.styleguide.docFactory;
    try {
      switch(this.config.type) {
        case "md":
          contentPromise = Doc.create(path.resolve(this.styleguide.config.cwd, this.config.content), this.config.label).load()
          .then((doc) => {
            let ctx = Object.assign({}, this.config, {content: doc.compiled})
            var pageLayout = this.styleguide.components.find('sg.page').view.template;
            doc.compiled = pageLayout(ctx);

            return doc;
          });
          break;
        case "tags":
          contentPromise = this.buildComponentList({label: this.label, tags: this.config.content});
          break;
        case "link":
          contentPromise = this.setupExternalLink({link: this.config.content});
          break;
        case "components":
          if (!!this.config.preflight) {
            contentPromise = Doc.create(path.resolve(this.styleguide.config.cwd, this.config.preflight), this.config.label)
              .load()
              .then((preflight) => {
                return this.buildComponentList({ label: this.label, components: this.config.content, preflight: preflight.compiled });
              });
          } else {
            contentPromise = this.buildComponentList({ label: this.label, components: this.config.content});
          }
          break;
        default:
          /** FOR UNKNOWN TYPES */
          warn("Page.buildContent - config.type unknown", this.config.type);
          contentPromise = Promise.resolve(null);
      }
    } catch(e) {
      return Promise.reject(e);
    }

    return contentPromise.then((content: PlainComponentList) => {
      if (content !== null) {
        if (content instanceof PlainComponentList) {
          this.componentList = content;
        }

        this.content = content;
      }

      return this;
    });
  }

  build():Promise<Page> {
    return this.resolveChildren()
    .then((page) => this.buildContent())
    .then(() => { return this; });
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
    if (this.notRenderable || !!this.content) {
      var preparation;

      var pageContext:IPageLayoutContext = Object.assign({}, context);
      /** root and cwd are important properties for the relative link helper we made available in the handlebars engine */
      pageContext.root = this.root;
      pageContext.cwd = this.cwd;

      if (this.content instanceof PlainComponentList) {
        preparation = this.componentList.render(pageContext)
        .then((plainComponentList) => {
          pageContext.content = plainComponentList.compiled;
        });
      } else {
        pageContext.content = this.content.compiled;
        preparation = Promise.resolve(this);
      }

      /** applying here, because of stupid type defintion with multiargs :/ */

      return preparation
      .then(page => {
        return fsoutputfile.apply(this, [this.target, layout(pageContext)]);
      })
      .then(page => this.writeChildren(layout, context))
      .then((file:any) => {
        return this;
      })
      .catch(e => error("OMG", e.stack));
    } else {
      return Promise.resolve(this);
    }
  }
}
