import {warn} from './Logger';

interface IRegistryLink {
  link: string;
  context: any;
}

export class LinkRegistry {
  private links: { [key: string]: IRegistryLink };
  constructor() {
    this.links = {};
  }

  public add(key:string, link:string, context: any) {
    this.links[key] = {
      link: link,
      context: context
    };
  }

  public find(key:string):IRegistryLink {
    try {
      return this.links[key];
    } catch(e) {
      warn("LinkRegistry.find", e.message);
      return null;
    }
  }

  public entries():string[] {
    return Object.keys(this.links);
  }
}
