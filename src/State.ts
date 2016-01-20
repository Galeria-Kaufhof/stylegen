import * as path from 'path';
import {Doc} from './Doc';
import {Component} from './Component';
import * as slug from 'slug';

export interface IStateConfig {
  label?: string;
  doc?: string;
  context?: any;
  slug?: string;
}

export interface IState {
  id?: string;
  label?: string;
  doc?: Doc;
  context?: {}|{}[];
  slug?: string;
}


export class State implements IState {
  public label: string;
  public doc: Doc;
  public context: {}|{}[];
  public slug: string;

  constructor(public id:string, private component:Component, private config: IStateConfig) {
    this.label = config.label;
    this.id = config.id || slug(this.label.toLowerCase());
    this.slug = `${this.component.slug}-${this.config.slug || this.id}`;
    this.context = config.context;
  }

  load():Promise<State> {
    if (!!this.config.doc) {
      var p = path.resolve(this.component.config.path, this.config.doc);
      return Doc.create(p, this.config.doc).load()
      .then((doc:Doc) => {
        this.doc = doc;
        return Promise.resolve(this);
      });
    } else {
      return Promise.resolve(this);
    }
  }
}
