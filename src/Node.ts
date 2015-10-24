import * as path from 'path';
import * as Q from 'q';
import * as fs from 'fs';

export class Node {
  id: string;
  path: string;
  files: string[];
  children: Node[];

  constructor(nodePath:string, files:[string], parent?:Node, options?:{}) {
    var parentPath:string;

    if (!parent) {
      parentPath = path.resolve(nodePath, '..');
    } else {
      parentPath = parent.path;
    }

    var nodeName:string = nodePath.slice(parentPath.length + 1);

    this.id = nodeName;
    this.files = files;
  }

  resolveComponent():Q.Promise<Node> {
    var d:Q.Deferred<Node> = Q.defer<Node>();

    var componentConfig:string = this.files.find((x) => x == 'component.json');

    if (componentConfig) {
      
    };

    d.resolve(this);

    return d.promise;
  }

  resolve():Q.Promise<Node> {
    var d:Q.Deferred<Node> = Q.defer<Node>();
    this.resolveComponent()
    .then((node) => {
      d.resolve(node);
    });
    return d.promise;
  }

  public static fromPath(nodePath:string):Q.Promise<Node> {
    var d:Q.Deferred<Node> = Q.defer<Node>();

    Q.nfcall(fs.readdir, nodePath)
    .then((files:[string]) => {
      return new Node(nodePath, files).resolve()
      .then((node) => {
        d.resolve(node);
      });
    })
    .catch((e) => {
      console.log("Node.fromPath:", nodePath, "failed");
      throw(e);
    });

    return d.promise;
  }
}
