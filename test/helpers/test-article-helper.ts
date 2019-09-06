import { TestUserInfoHelper } from './test-user-info-helper';
import slugify from '@sindresorhus/slugify';
import { Chance } from 'chance';
import { ArticleRO } from 'src/modules/article/article.interface';
import { UpdateArticleDto } from 'src/modules/article/dto';
const chance = new Chance();
let id = 0;
export interface ArticleInfo {
  slug: string;
  slugReal?: string;
  title: string;
  description: string;
  body: string;
  tagList?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  favorited?: boolean;
  favoritesCount?: number;
  author?: any;
}

export interface ArticleROParam {
  favorited?: boolean;
  favoritesCount?: number;
  following?: boolean;
}

export class TestArticleHelper {
  info: ArticleInfo;
  constructor(private readonly author: TestUserInfoHelper) {
    this.info = {
      slug: '',
      title: '',
      description: chance.paragraph({ sentences: 2 }).slice(0, 100),
      body: chance.paragraph({ sentences: 3 }),
      tagList:
        id % 2 === 0
          ? Array(3)
              .fill(0)
              .map(i => chance.word())
          : [],
    };

    this.setTitle(chance.sentence({ words: 5 }));
    id++;
  }

  private setTitle(newTitle: string) {
    this.info.title = newTitle.slice(0, 50);
    this.info.slug = slugify(newTitle, { lowercase: true });
  }

  getCreateDto() {
    return {
      title: this.info.title,
      description: this.info.description,
      body: this.info.body,
      tagList: this.info.tagList,
    };
  }

  getArticleRO({
    favorited = false,
    favoritesCount = 0,
    following = false,
  }: ArticleROParam = {}): ArticleRO {
    const {
      slug,
      title,
      description,
      body,
      tagList,
      createdAt,
      updatedAt,
    } = this.info;
    return {
      article: {
        slug,
        title,
        description,
        body,
        tagList,
        createdAt: createdAt || new Date(),
        updatedAt: updatedAt || new Date(),
        favorited,
        favoritesCount,
        author: this.author.getProfileRO(following).profile,
      },
    };
  }

  validateArticleRO(
    expect: jest.Expect,
    res: any,
    paramRO: ArticleROParam = {},
    updateInfo: UpdateArticleDto = {},
  ) {
    this.update(updateInfo);
    const resArticle: ArticleRO['article'] = res.body.article;
    const expectArticle = this.getArticleRO(paramRO).article;

    const exactMatchKeys = [
      'title',
      'description',
      'body',
      'tagList',
      'favorited',
      'favoritesCount',
      'author',
    ];
    exactMatch(expect, resArticle, expectArticle, exactMatchKeys);
    matchSlug(expect, resArticle.slug, expectArticle.slug);
    this.info.slugReal = resArticle.slug;
    // @TODO validate createdAt & updatedAt
  }

  private update(info: UpdateArticleDto) {
    Object.assign(this.info, info);
    if (info.title) {
      this.setTitle(info.title);
    }
  }
}

function exactMatch(
  expect: jest.Expect,
  result: any,
  expectation: any,
  keys: string[],
) {
  keys.forEach(key => {
    if (Array.isArray(result[key])) {
      expect(result[key]).toEqual(expect.arrayContaining(expectation[key]));
    } else if (typeof result[key] === 'object') {
      expect(result[key]).toEqual(expectation[key]);
    } else {
      expect(result[key]).toBe(expectation[key]);
    }
  });
}

function matchSlug(expect: jest.Expect, resSlug: string, expectSlug: string) {
  const len = expectSlug.length;

  expect(resSlug.slice(0, len)).toBe(expectSlug);
}
