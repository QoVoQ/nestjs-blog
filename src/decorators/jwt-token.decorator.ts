import { createParamDecorator } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
const extractor = ExtractJwt.fromAuthHeaderWithScheme('Token');
/**
 * Get token from http header Authorization
 */
export const JwtToken = createParamDecorator((data, req) => {
  return extractor(req);
});
