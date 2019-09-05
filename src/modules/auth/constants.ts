import { ExtractJwt } from 'passport-jwt';

export const jwtConstants = {
  secret: 'jwtToken',
};

export const jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('Token');
