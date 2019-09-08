import { TestUserInfoHelper } from './test-user-info-helper';
import { TestArticleHelper } from './test-article-helper';
import { Chance } from 'chance';
let dbId = 0;
export class TestCommentHelper {
  author: TestUserInfoHelper;
  article: TestArticleHelper;
  msg: string;
  id: string;

  dbId: number;
  constructor(
    author: TestUserInfoHelper,
    article: TestArticleHelper,
    id: string,
    msg: string = 'This is comment' + Chance().word(),
  ) {
    this.author = author;
    this.article = article;
    this.msg = msg;
    this.id = id;
    this.dbId = ++dbId;
  }
}
