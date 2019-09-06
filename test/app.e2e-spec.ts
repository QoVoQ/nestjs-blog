import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppTestModule } from './modules/app-test.module';
import { TestUserInfoHelper } from './helpers/test-user-info-helper';
import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  TestArticleHelper,
  ArticleROParam,
} from './helpers/test-article-helper';
import { UpdateArticleDto } from 'src/modules/article/dto';
import { globalSetting } from 'src/app.global-setting';

let moduleFixture: TestingModule;
let app: INestApplication;
let server;
let user1: TestUserInfoHelper;
let user2: TestUserInfoHelper;
let user1Article1: TestArticleHelper;
let user1Article2: TestArticleHelper;
let user1Article3: TestArticleHelper;

beforeAll(async () => {
  user1 = new TestUserInfoHelper();
  user2 = new TestUserInfoHelper();
  user1Article1 = new TestArticleHelper(user1);
  user1Article2 = new TestArticleHelper(user1);
  user1Article3 = new TestArticleHelper(user1);

  moduleFixture = await Test.createTestingModule({
    imports: [AppTestModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  globalSetting(app);

  server = app.getHttpServer();
  await app.init();
});

afterAll(async () => {
  app.close();
});

describe('AppController (e2e)', () => {
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('User and Auth module', () => {
    const loginFn = async user =>
      request(server)
        .post('/users/login')
        .send(user.getLoginInfo())
        .expect(HttpStatus.CREATED)
        .then(res => {
          user.validateUserRO(expect, res);
        });

    const registerFn = async (user: TestUserInfoHelper) =>
      request(server)
        .post('/users')
        .send(user.getRegisterInfo())
        .expect(HttpStatus.CREATED)
        .then(res => {
          user.validateUserRO(expect, res);
        });
    it('POST /users: Register should return valid userRO', () => {
      return Promise.all([registerFn(user1), registerFn(user2)]);
    });

    it('POST /users/login: Login should return valid userRO', () => {
      return Promise.all([loginFn(user1), loginFn(user2)]);
    });

    describe('GET /user: Get status', () => {
      it('Get status without token should return 401', () => {
        return request(server)
          .get('/user')
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('Get status with token should return valid userRO', () => {
        return request(server)
          .get('/user')
          .set(user1.getAuthHeader())
          .expect(HttpStatus.OK)
          .then(res => {
            user1.validateUserRO(expect, res);
          });
      });
    });

    describe('PUT /user: Update user', () => {
      it('Update with invalid params should return 422', () => {
        return request(server)
          .put('/user')
          .set(user1.getAuthHeader())
          .send({
            bio: 231,
          })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });

      it('Update with valid params should return 200 and info get updated', () => {
        const infoToUpdate = {
          email: 'newAdmin@admin.com',
          username: 'adminNew',
          password: '666666',
          bio: 'This is my bio',
          image: 'THis is my image',
        };
        return request(server)
          .put('/user')
          .set(user1.getAuthHeader())
          .send(infoToUpdate)
          .expect(HttpStatus.OK)
          .then(res => {
            user1.validateUserRO(expect, res, infoToUpdate);

            return loginFn(user1);
          });
      });
    });

    describe('Profile Related API', () => {
      describe('GET /profiles/:username', () => {
        it('Get self profile should get valid profileRO', () => {
          const getProfile = async user => {
            return request(server)
              .get(`/profiles/${user.userInfo.username}`)
              .set(user.getAuthHeader())
              .send()
              .expect(HttpStatus.OK)
              .then(res => {
                expect(res.body).toEqual(user.getProfileRO(false));
              });
          };
          return Promise.all([getProfile(user1), getProfile(user2)]);
        });

        it('Get profile without authentication should get valid profileRO', () => {
          return request(server)
            .get(`/profiles/${user1.userInfo.username}`)
            .send()
            .expect(HttpStatus.OK)
            .then(res => {
              expect(res.body).toEqual(user1.getProfileRO(false));
            });
        });
      });

      describe('POST /profiles/:username/follow', () => {
        it('Following:  profile(following) should update', () => {
          return request(server)
            .post(`/profiles/${user2.userInfo.username}/follow`)
            .set(user1.getAuthHeader())
            .send()
            .expect(HttpStatus.CREATED)
            .then(res => {
              expect(res.body).toEqual(user2.getProfileRO(true));
            });
        });

        it('Following: the same one twice should not throw error', () => {
          return request(server)
            .post(`/profiles/${user2.userInfo.username}/follow`)
            .set(user1.getAuthHeader())
            .send()
            .expect(HttpStatus.CREATED)
            .then(res => {
              expect(res.body).toEqual(user2.getProfileRO(true));
            });
        });

        it('Following:  profile(following) should update', () => {
          return request(server)
            .post(`/profiles/${user1.userInfo.username}/follow`)
            .set(user2.getAuthHeader())
            .send()
            .expect(HttpStatus.CREATED)
            .then(res => {
              expect(res.body).toEqual(user1.getProfileRO(true));
            });
        });
      });

      describe('DELETE /profiles/:username/follow', () => {
        it('Unfollowing: profile(following) should update', () => {
          return request(server)
            .delete(`/profiles/${user2.userInfo.username}/follow`)
            .set(user1.getAuthHeader())
            .send()
            .expect(HttpStatus.OK)
            .then(res => {
              expect(res.body).toEqual(user2.getProfileRO(false));
            });
        });

        it('Unfollowing: the same one twice should not throw error', () => {
          return request(server)
            .delete(`/profiles/${user2.userInfo.username}/follow`)
            .set(user1.getAuthHeader())
            .send()
            .expect(HttpStatus.OK)
            .then(res => {
              expect(res.body).toEqual(user2.getProfileRO(false));
            });
        });
      });
    });
  });

  describe('Article Module', () => {
    describe('POST /articles: Create article', () => {
      it('should success with authentication and valid input', () => {
        const createArticle = async (art: TestArticleHelper) =>
          request(server)
            .post('/articles')
            .set(user1.getAuthHeader())
            .send(art.getCreateDto())
            .expect(HttpStatus.CREATED)
            .then(res => {
              art.validateArticleRO(expect, res);
            });

        return Promise.all([
          createArticle(user1Article1),
          createArticle(user1Article2),
          createArticle(user1Article3),
        ]);
      });

      it('should get 401 without authentication ', () => {
        return request(server)
          .post('/articles')
          .send(user1Article1.getCreateDto())
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should get 422 with invalid input', () => {
        return request(server)
          .post('/articles')
          .set(user1.getAuthHeader())
          .send({ title: 123 })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });
    });

    describe('GET /articles/:slug : Get article by slug', () => {
      it('should success with valid article slug', () => {
        return request(server)
          .get(`/articles/${user1Article1.info.slugReal}`)
          .expect(HttpStatus.OK)
          .then(res => {
            user1Article1.validateArticleRO(expect, res);
          });
      });

      it('should fail with invalid article slug', () => {
        return request(server)
          .get(`/articles/sdklwer`)
          .expect(HttpStatus.OK)
          .then(res => {
            expect(res.body.article).toBeNull();
          });
      });

      it('property "author.following" should be true for user2 following user1', () => {
        return request(server)
          .get(`/articles/${user1Article1.info.slugReal}`)
          .set(user2.getAuthHeader())
          .expect(HttpStatus.OK)
          .then(res => {
            user1Article1.validateArticleRO(expect, res, { following: true });
          });
      });
    });

    describe('PUT /articles/:slug Update article', () => {
      it('should success with authentication and valid input', () => {
        const updateDto: UpdateArticleDto = {
          title: 'Updated title',
          description: 'new desc',
          body: 'Long long body',
        };
        return request(server)
          .put(`/articles/${user1Article1.info.slugReal}`)
          .set(user1.getAuthHeader())
          .send(updateDto)
          .expect(HttpStatus.OK)
          .then(res => {
            user1Article1.validateArticleRO(expect, res, undefined, updateDto);
          });
      });

      it('should get 401 without authentication ', () => {
        return request(server)
          .put(`/articles/${user1Article1.info.slugReal}`)
          .send(user1Article1.getCreateDto())
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should get 403 with non-author authentication ', () => {
        return request(server)
          .put(`/articles/${user1Article1.info.slugReal}`)
          .set(user2.getAuthHeader())
          .send({ title: 'new Title' })
          .expect(HttpStatus.FORBIDDEN);
      });

      it('should get 422 with invalid input', () => {
        return request(server)
          .put(`/articles/${user1Article1.info.slugReal}`)
          .set(user1.getAuthHeader())
          .send({ body: 123 })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });

      it('should get 422 with non exit article', () => {
        return request(server)
          .put(`/articles/non-exist-article`)
          .set(user1.getAuthHeader())
          .send({ body: '123' })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });
    });

    describe('DELETE /article/:slug', () => {
      it('should fail with non-author authentication', () => {
        return request(server)
          .delete(`/articles/${user1Article1.info.slugReal}`)
          .set(user2.getAuthHeader())
          .expect(HttpStatus.FORBIDDEN);
      });
      it('should success with authentication and valid input', () => {
        return request(server)
          .delete(`/articles/${user1Article1.info.slugReal}`)
          .set(user1.getAuthHeader())
          .expect(HttpStatus.OK)
          .then(res => {
            expect(res.body.affected).toBe(1);
          });
      });

      it('should get 401 without authentication ', () => {
        return request(server)
          .delete(`/articles/${user1Article1.info.slugReal}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should get 422 with non-exit article', () => {
        return request(server)
          .delete(`/articles/no-exits-article`)
          .set(user1.getAuthHeader())
          .expect(HttpStatus.UNPROCESSABLE_ENTITY)
          .then(res => {
            expect(res.body).toHaveProperty('errors');
          });
      });
    });

    describe('Favorite && Unfavorite', () => {
      describe('POST /articles/:slug/favorite', () => {
        const favoriteFn = async (
          article: TestArticleHelper,
          user: TestUserInfoHelper,
          expectResult: ArticleROParam,
        ) => {
          return request(server)
            .post(`/articles/${article.info.slugReal}/favorite`)
            .set((user && user.getAuthHeader()) || undefined)
            .expect(HttpStatus.CREATED)
            .then(res => {
              article.validateArticleRO(expect, res, expectResult);
            });
        };
        it('"favouritesCount" & "favorited" should update after favorite', () => {
          return favoriteFn(user1Article2, user2, {
            favorited: true,
            favoritesCount: 1,
            following: true,
          }).then(() =>
            favoriteFn(user1Article2, user1, {
              favorited: true,
              favoritesCount: 2,
              following: false,
            }),
          );
        });
        it('should not fail favorite the same article', () => {
          return favoriteFn(user1Article2, user2, {
            favorited: true,
            favoritesCount: 2,
            following: true,
          });
        });
        it('should get 401 without authentication', () => {
          return request(server)
            .post(`/articles/${user1Article2.info.slugReal}/favorite`)
            .expect(HttpStatus.UNAUTHORIZED);
        });
        it('should get 422 when article does not exit', () => {
          return request(server)
            .post(`/articles/no-exits-article/favorite`)
            .set(user1.getAuthHeader())
            .expect(HttpStatus.UNPROCESSABLE_ENTITY);
        });
      });
      describe('DELETE /articles/:slug', () => {
        it('"favouritesCount" & "favorited" should update after unfavorite', () => {});
        it('should not fail unfavorite the same article', () => {});
        it('should get 401 without authentication', () => {});
        it('should get 422 when article does not exit', () => {});
      });
    });
  });

  describe('Tag module', () => {
    it('GET /tags', () => {
      return request(server)
        .get('/tags')
        .expect(HttpStatus.OK)
        .then(res => {
          expect(res.body.tags.length).toBeGreaterThan(2);
        });
    });
  });
});
