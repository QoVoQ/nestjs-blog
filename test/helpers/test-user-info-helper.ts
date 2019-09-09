import { UserData, UserRO } from 'src/modules/user/user.entity';
import { ProfileRO } from 'src/modules/profile/profile.interface';
import { TestArticleHelper } from './test-article-helper';
import { TestCommentHelper } from './test-comment-helper';
import { Test } from '@nestjs/testing';

export class TestUserInfoHelper {
  static uid: number = 0;
  userInfo: UserData & { password: string };
  followings: TestUserInfoHelper[] = [];
  works: TestArticleHelper[] = [];
  favorites: TestArticleHelper[] = [];

  constructor() {
    const Ctor = TestUserInfoHelper;
    this.userInfo = {
      username: `adminTest${Ctor.uid}`,
      email: `adminTest${Ctor.uid}@adminTest.com`,
      bio: '',
      image: '',
      token: '',
      password: 'adminTest',
    };
    Ctor.uid++;
  }

  update(info) {
    const { userInfo } = this;
    return Object.assign(userInfo, info);
  }
  getUserRO() {
    const {
      userInfo: { password, ...userRO },
    } = this;

    return userRO;
  }

  getLoginInfo() {
    const { userInfo } = this;

    return {
      username: userInfo.email,
      password: userInfo.password,
    };
  }

  getRegisterInfo() {
    const { userInfo } = this;
    return {
      username: userInfo.username,
      email: userInfo.email,
      password: userInfo.password,
    };
  }

  getAuthHeader() {
    const {
      userInfo: { token },
    } = this;
    return { Authorization: `Token ${token}` };
  }

  follow(user: TestUserInfoHelper) {
    this.followings.push(user);
  }

  unfollow(user: TestUserInfoHelper) {
    const idx = this.followings.indexOf(user);
    if (idx !== -1) {
      this.followings.splice(idx, 1);
    }
  }

  isFollowing(a: TestUserInfoHelper): boolean {
    return this.followings.includes(a);
  }

  createArticle(articleId: string, tags?: string[]): TestArticleHelper {
    const a = new TestArticleHelper(this, articleId, tags);
    this.works.push(a);
    return a;
  }

  removeWork(article: TestArticleHelper) {
    const idx = this.works.indexOf(article);
    if (idx !== -1) {
      this.works.splice(idx, 1);
    }
  }

  getWorksById(articleId: string) {
    return this.works.find(a => {
      return a.id === articleId;
    });
  }

  favorite(article: TestArticleHelper) {
    this.favorites.push(article);
    article.favoritedBy.push(this);
  }

  unfavorite(article: TestArticleHelper) {
    const idx = this.favorites.indexOf(article);
    if (idx !== -1) {
      this.favorites.splice(idx, 1);
    }
  }

  getFavoriteById(articleId: string) {
    return this.favorites.find(a => a.id === articleId);
  }

  commentOn(article: TestArticleHelper, id: string, msg?: string) {
    const comment = new TestCommentHelper(this, article, id, msg);
    article.comments.push(comment);
    return comment;
  }

  validateUserRO(expFn: jest.Expect, res: any, updatedInfo = {}) {
    const { userInfo } = this;
    const userRO: UserRO = res.body;
    expFn(userRO).toHaveProperty('user');
    const userData = userRO.user;
    expFn(userData).toHaveProperty('token');

    // update token
    userInfo.token = userData.token;
    expFn(
      typeof userInfo.token === 'string' && userInfo.token.length > 10,
    ).toBe(true);

    this.update(updatedInfo);
    expFn(userData).toEqual(this.getUserRO());

    return userData;
  }

  getProfileRO(following: boolean): ProfileRO {
    const {
      userInfo: { password, email, token, ...profileData },
    } = this;

    return {
      profile: { ...profileData, following },
    };
  }
}
