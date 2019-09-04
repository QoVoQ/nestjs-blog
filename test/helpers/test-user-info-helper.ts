import { UserData, UserRO } from 'src/modules/user/user.entity';
import { ProfileRO } from 'src/modules/profile/profile.interface';

export class TestUserInfoHelper {
  static uid: number = 0;
  userInfo: UserData & { password: string };

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
