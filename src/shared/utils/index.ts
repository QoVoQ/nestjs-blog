import { createHmac } from 'crypto';
export function hashPassword(pwd) {
  return createHmac('sha256', pwd).digest('hex');
}
