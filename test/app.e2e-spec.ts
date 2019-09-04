import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppTestModule } from './modules/app-test.module';
import { TestUserInfoHelper } from './helpers/test-user-info-helper';
import { HttpStatus } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app;
  let server;

  const user1 = new TestUserInfoHelper();
  const user2 = new TestUserInfoHelper();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  afterAll(async () => {
    app.close();
  });

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
          return request(server)
            .get(`/profiles/${user1.userInfo.username}`)
            .set(user1.getAuthHeader())
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
      });
    });
  });
});
