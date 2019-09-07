import { TestUserInfoHelper } from 'test/helpers/test-user-info-helper';
import { TestArticleHelper } from 'test/helpers/test-article-helper';
import { TestCommentHelper } from 'test/helpers/test-comment-helper';
import { delay } from 'src/shared/utils';

export function playStroy(): {
  roles: TestUserInfoHelper[];
  articles: TestArticleHelper[];
  comments: TestCommentHelper[];
  writerRole: TestUserInfoHelper;
  articleScience: TestArticleHelper;
} {
  const roles = Array(3)
    .fill(0)
    .map(i => new TestUserInfoHelper());
  const writerRole = roles[0];

  roles[1].follow(roles[0]);

  // this relation will be removed during test
  roles[0].follow(roles[1]);

  const articles = [
    writerRole.createArticle('Science'),
    // 'Failure' will be removed during test
    writerRole.createArticle('Failure'),
    roles[1].createArticle('Bible'),
  ];

  const articleScience = writerRole.getWorksById('Science');
  // roles[0] favorite will be removed during test
  roles[0].favorite(articleScience);
  roles[1].favorite(articleScience);

  const comments = [
    roles[1].commentOn(articleScience, 'toDelete'),
    roles[1].commentOn(articleScience, 'brilliant'),
    roles[2].commentOn(articleScience, 'amazing'),
  ];

  return { roles, articles, comments, writerRole, articleScience };
}
