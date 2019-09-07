import { createHmac } from 'crypto';
export function hashPassword(pwd) {
  return createHmac('sha256', pwd).digest('hex');
}

export async function delay(time = 200) {
  return new Promise(r => {
    setTimeout(r, time);
  });
}

export async function runSequentially(
  promiseFactories: Array<(...args) => Promise<any>>,
): Promise<any> {
  const promises = [];
  for (const factory of promiseFactories) {
    const p = await factory();
    promises.push(p);
  }
  return Promise.all(promises);
}
