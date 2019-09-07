import { createHmac } from 'crypto';
export function hashPassword(pwd) {
  return createHmac('sha256', pwd).digest('hex');
}

export async function delay(time = 200) {
  return new Promise(r => {
    setTimeout(r, time);
  });
}
