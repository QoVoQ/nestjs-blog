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
import { delay, runSequentially } from 'src/shared/utils';
import { TestCommentHelper } from './helpers/test-comment-helper';
import { playStroy } from './test-story';
import { CommentData } from 'src/modules/comment/comment.interface';

let moduleFixture: TestingModule;
let app: INestApplication;
let server;
let roles: TestUserInfoHelper[];
let writerRole: TestUserInfoHelper;
let articles: TestArticleHelper[];
let articleScience: TestArticleHelper;
let comments: TestCommentHelper[];
// PS: runtime error maybe swallowed here, won't log any error msg in console
({ roles, articles, comments, writerRole, articleScience } = playStroy());

beforeAll(async () => {
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
      const factories = roles.map(role => () => registerFn(role));
      return runSequentially(factories);
    });

    it('POST /users/login: Login should return valid userRO', () => {
      return Promise.all(roles.map(role => loginFn(role)));
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
          .set(roles[0].getAuthHeader())
          .expect(HttpStatus.OK)
          .then(res => {
            roles[0].validateUserRO(expect, res);
          });
      });
    });

    describe('PUT /user: Update user', () => {
      it('Update with invalid params should return 422', () => {
        return request(server)
          .put('/user')
          .set(roles[0].getAuthHeader())
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
          .set(roles[2].getAuthHeader())
          .send(infoToUpdate)
          .expect(HttpStatus.OK)
          .then(res => {
            roles[2].validateUserRO(expect, res, infoToUpdate);

            return loginFn(roles[2]);
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
          return Promise.all([getProfile(roles[0]), getProfile(roles[1])]);
        });

        it('Get profile without authentication should get valid profileRO', () => {
          return request(server)
            .get(`/profiles/${roles[0].userInfo.username}`)
            .send()
            .expect(HttpStatus.OK)
            .then(res => {
              expect(res.body).toEqual(roles[0].getProfileRO(false));
            });
        });
      });
      describe('Follow & Unfollow', () => {
        const followFn = async (follower, followee) =>
          request(server)
            .post(`/profiles/${followee.userInfo.username}/follow`)
            .set(follower.getAuthHeader())
            .send()
            .expect(HttpStatus.CREATED)
            .then(res => {
              expect(res.body).toEqual(followee.getProfileRO(true));
            });

        const followAll = () =>
          Promise.all(
            roles.map(follower => {
              return Promise.all(
                follower.followings.map(followee =>
                  followFn(follower, followee),
                ),
              );
            }),
          );
        describe('POST /profiles/:username/follow', () => {
          it('Following:  profile(following) should update', () => {
            return followAll();
          });

          it('Following: the same one twice should not throw error', () => {
            return followAll();
          });
        });

        describe('DELETE /profiles/:username/follow', () => {
          it('Unfollowing: profile(following) should update', () => {
            return request(server)
              .delete(`/profiles/${roles[1].userInfo.username}/follow`)
              .set(roles[0].getAuthHeader())
              .send()
              .expect(HttpStatus.OK)
              .then(res => {
                expect(res.body).toEqual(roles[1].getProfileRO(false));
                roles[0].unfollow(roles[1]);
              });
          });

          it('Unfollowing: the same one twice should not throw error', () => {
            return request(server)
              .delete(`/profiles/${roles[1].userInfo.username}/follow`)
              .set(roles[0].getAuthHeader())
              .send()
              .expect(HttpStatus.OK)
              .then(res => {
                expect(res.body).toEqual(roles[1].getProfileRO(false));
              });
          });
        });
      });
    });
  });

  describe('Article Module', () => {
    describe('POST /articles: Create article', () => {
      it('should success with authentication and valid input', () => {
        const createArticle = async (art: TestArticleHelper) => {
          const { author } = art;
          return request(server)
            .post('/articles')
            .set(author.getAuthHeader())
            .send(art.getCreateDto())
            .expect(HttpStatus.CREATED)
            .then(res => {
              art.validateArticleRO(expect, res);
            });
        };
        const factories = articles.map(art => () => createArticle(art));
        return runSequentially(factories);
      });
      it('should get 401 without authentication ', () => {
        return request(server)
          .post('/articles')
          .send(articles[0].getCreateDto())
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should get 422 with invalid input', () => {
        return request(server)
          .post('/articles')
          .set(roles[0].getAuthHeader())
          .send({ title: 123 })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });
    });

    describe('GET /articles/:slug : Get article by slug', () => {
      it('should success with valid article slug', () => {
        return request(server)
          .get(`/articles/${articles[0].info.slugReal}`)
          .expect(HttpStatus.OK)
          .then(res => {
            articles[0].validateArticleRO(expect, res);
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

      it('property "author.following" should be true for roles[1] following writerRole', () => {
        const work = writerRole.works[0];
        return request(server)
          .get(`/articles/${work.info.slugReal}`)
          .set(roles[1].getAuthHeader())
          .expect(HttpStatus.OK)
          .then(res => {
            work.validateArticleRO(expect, res, { following: true });
          });
      });
    });
    describe('PUT /articles/:slug Update article', () => {
      const updateDto: UpdateArticleDto = {
        title: 'Updated title',
        description: 'new desc',
        body: 'Long long body',
      };
      const author = roles[0];
      const workToUpdate = author.works[0];
      it('should success with authentication and valid input', () => {
        return request(server)
          .put(`/articles/${workToUpdate.info.slugReal}`)
          .set(author.getAuthHeader())
          .send(updateDto)
          .expect(HttpStatus.OK)
          .then(res => {
            workToUpdate.validateArticleRO(expect, res, undefined, updateDto);
          });
      });

      it('should get 401 without authentication ', () => {
        return request(server)
          .put(`/articles/${workToUpdate.info.slugReal}`)
          .send(workToUpdate.getCreateDto())
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should get 403 with non-author authentication ', () => {
        return request(server)
          .put(`/articles/${workToUpdate.info.slugReal}`)
          .set(roles[1].getAuthHeader())
          .send({ title: 'new Title' })
          .expect(HttpStatus.FORBIDDEN);
      });

      it('should get 422 with invalid input', () => {
        return request(server)
          .put(`/articles/${workToUpdate.info.slugReal}`)
          .set(author.getAuthHeader())
          .send({ body: 123 })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });

      it('should get 422 with non exit article', () => {
        return request(server)
          .put(`/articles/non-exist-article`)
          .set(author.getAuthHeader())
          .send({ body: '123' })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });
    });

    describe('DELETE /article/:slug', () => {
      const workToDelete = writerRole.works[1];
      it('should fail with non-author authentication', () => {
        return request(server)
          .delete(`/articles/${workToDelete.info.slugReal}`)
          .set(roles[1].getAuthHeader())
          .expect(HttpStatus.FORBIDDEN);
      });
      it('should success with authentication and valid input', () => {
        return request(server)
          .delete(`/articles/${workToDelete.info.slugReal}`)
          .set(writerRole.getAuthHeader())
          .expect(HttpStatus.OK)
          .then(res => {
            expect(res.body.affected).toBe(1);
            writerRole.removeWork(workToDelete);
            articles.splice(1, 1);
          });
      });

      it('should get 401 without authentication ', () => {
        return request(server)
          .delete(`/articles/${workToDelete.info.slugReal}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should get 422 with non-exit article', () => {
        return request(server)
          .delete(`/articles/no-exits-article`)
          .set(writerRole.getAuthHeader())
          .expect(HttpStatus.UNPROCESSABLE_ENTITY)
          .then(res => {
            expect(res.body).toHaveProperty('errors');
          });
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
      const favAll = async (staticCount?: number) => {
        let favCount = 0;

        const favParams = roles.reduce((acc, role) => {
          return acc.concat(
            role.favorites.reduce((accc, art) => {
              accc.push([
                art,
                role,
                {
                  favorited: true,
                  following: role.isFollowing(writerRole),
                  favoritesCount: staticCount || ++favCount,
                },
              ]);
              return accc;
            }, []),
          );
        }, []);

        const factories = favParams.map(param => () =>
          favoriteFn.apply(null, param),
        );
        return runSequentially(factories);
      };
      it('"favouritesCount" & "favorited" should update after favorite', () => {
        return favAll();
      });

      it('should not fail favorite the same article', () => {
        return favAll(2);
      });
      it('should get 401 without authentication', () => {
        return request(server)
          .post(`/articles/${roles[0].works[0].info.slugReal}/favorite`)
          .expect(HttpStatus.UNAUTHORIZED);
      });
      it('should get 422 when article does not exit', () => {
        return request(server)
          .post(`/articles/no-exits-article/favorite`)
          .set(roles[0].getAuthHeader())
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });
    });
    describe('DELETE /articles/:slug/favorite', () => {
      const articleToUnfavorite = writerRole.favorites[0];
      const unfavoriteFn = async (
        article: TestArticleHelper,
        user: TestUserInfoHelper,
        expectResult: ArticleROParam,
      ) => {
        return request(server)
          .delete(`/articles/${article.info.slugReal}/favorite`)
          .set((user && user.getAuthHeader()) || undefined)
          .expect(HttpStatus.OK)
          .then(res => {
            article.validateArticleRO(expect, res, expectResult);
            writerRole.unfavorite(articleToUnfavorite);
          });
      };
      it('"favouritesCount" & "favorited" should update after unfavorite', () => {
        return unfavoriteFn(articleToUnfavorite, writerRole, {
          favorited: false,
          favoritesCount: 1,
          following: false,
        });
      });
      it('should not fail unfavorite the same article', () => {
        return unfavoriteFn(articleToUnfavorite, writerRole, {
          favorited: false,
          favoritesCount: 1,
          following: false,
        });
      });
      it('should get 401 without authentication', () => {
        return request(server)
          .delete(`/articles/${articleToUnfavorite.info.slugReal}/favorite`)
          .expect(HttpStatus.UNAUTHORIZED);
      });
      it('should get 422 when article does not exit', () => {
        return request(server)
          .delete(`/articles/non-exist/favorite`)
          .set(roles[1].getAuthHeader())
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });
    });
  });

  describe('Comment Module', () => {
    describe('POST /articles/:slug/comment', () => {
      const createComment = async (
        article: TestArticleHelper,
        user: TestUserInfoHelper,
        msg: string = 'This is a comment' + new Date(),
        following: boolean = false,
      ) => {
        await delay(50);
        const body = msg;
        return request(server)
          .post(`/articles/${article.info.slugReal}/comments`)
          .set(user.getAuthHeader())
          .send({ comment: { body } })
          .expect(HttpStatus.CREATED)
          .then(res => {
            article.validateCommentRO(expect, res, user, {
              following,
              body,
            });
          });
      };
      it('should success', () => {
        // return Promise.all([
        //   createComment(user1Article2, user1, undefined, false),
        //   createComment(user1Article2, user2, undefined, false),
        // ]);
        const factories = comments.map(c => () =>
          createComment(c.article, c.author, undefined, false),
        );
        return runSequentially(factories);
      });

      it('should get 401 without authentication', () => {
        return request(server)
          .post(`/articles/${articles[0].info.slugReal}/comments`)
          .send({ comment: { body: 'Hello' } })
          .expect(HttpStatus.UNAUTHORIZED);
      });
      it('should get 422 with invalid input', () => {
        return request(server)
          .post(`/articles/${articles[0].info.slugReal}/comments`)
          .set(roles[1].getAuthHeader())
          .send({ comment: { body: 342 } })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });
    });

    describe('GET /articles/:slug/comments', () => {
      const validateComment = res => {
        expect(res.body).toHaveProperty('comments');
        const cmmts = res.body.comments;
        expect(cmmts.length).toBe(comments.length);
        expect(cmmts[0].author.username).toBe(
          comments[comments.length - 1].author.userInfo.username,
        );
        expect(+new Date(cmmts[0].createdAt)).toBeGreaterThan(
          +new Date(cmmts[1].createdAt),
        );
      };
      it('should success without authentication', () => {
        return request(server)
          .get(`/articles/${articleScience.info.slugReal}/comments`)
          .expect(HttpStatus.OK)
          .then(res => {
            validateComment(res);
            const [c1, c2] = res.body.comments;
            expect(c1.author.following).toBeFalsy();
            expect(c2.author.following).toBeFalsy();
          });
      });

      it('should success with authentication, "author.following" should be true', () => {
        return request(server)
          .get(`/articles/${articleScience.info.slugReal}/comments`)
          .set(roles[1].getAuthHeader())
          .expect(HttpStatus.OK)
          .then(res => {
            validateComment(res);
            // ps: return comments is ordered by created_at desc
            const cmmts: CommentData[] = res.body.comments.slice().reverse();
            cmmts.forEach((c, idx) => {
              expect(c.author.following).toBe(
                roles[1].isFollowing(comments[idx].author),
              );
            });
          });
      });
    });

    describe('DELETE /articles/:slug/comments', () => {
      const idToDelete = articleScience.comments[1].dbId;
      const nextDeletableId = idToDelete + 1;
      it('should success', () => {
        return request(server)
          .delete(
            `/articles/${articleScience.info.slugReal}/comments/${idToDelete}`,
          )
          .set(roles[1].getAuthHeader())
          .expect(HttpStatus.OK)
          .then(res => {
            expect(res.body.raw.affectedRows).toBe(1);
          });
      });
      it('should get 422 with invalid article slug', () => {
        return request(server)
          .delete(`/articles/not-exist-article/comments/${idToDelete + 1}`)
          .set(roles[1].getAuthHeader())
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });
      it('should get 422 with invalid comment id', () => {
        return request(server)
          .delete(`/articles/${articleScience.info.slugReal}/comments/srer`)
          .set(roles[1].getAuthHeader())
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });
      it('should get 403 if is not the comment author', () => {
        return request(server)
          .delete(
            `/articles/${articleScience.info.slugReal}/comments/${nextDeletableId}`,
          )
          .set(roles[0].getAuthHeader())
          .expect(HttpStatus.FORBIDDEN);
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
