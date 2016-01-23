import {ILayoutContext} from './StructureWriter';
import {Page} from './Page';

export interface IPageLayoutContext extends ILayoutContext {
  pages?: Page[];
  content?: string;
  cwd?: string;
  root?: string;
}
