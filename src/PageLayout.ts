import {Page} from './Page';

export interface IPageLayoutContext {
  cssDeps?: string[];
  jsDeps?: string[];

  pages?: Page[];
  content?: string;
  pagecwd?: string;
  pageroot?: string;
}
