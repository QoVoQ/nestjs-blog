import { hashPassword, runSequentially, delay } from '.';

describe('Share utils', () => {
  it('hashPassword', () => {
    const pwd = '123';
    const hashOf123 =
      '6d6cd63284be4a47ba7aec4a3458939a95dcbdd5cd0438f23d7457099b4b917c';
    expect(hashPassword(pwd)).toBe(hashOf123);
  });

  it('delay', async done => {
    const startTS = +new Date();
    await delay(100);
    const endTS = +new Date();
    const gap = endTS - startTS;
    expect(gap).toBeGreaterThan(99);
    expect(gap).toBeLessThan(110);
    done();
  });

  it('runSequentially', () => {
    const startTS = +new Date();
    return runSequentially([
      async () => {
        await delay(100);
        const ts1 = +new Date();
        expect(ts1 - startTS).toBeGreaterThan(99);
        return Promise.resolve();
      },
      async () => {
        await delay(200);
        const ts2 = +new Date();
        expect(ts2 - startTS).toBeGreaterThan(299);
        return Promise.resolve();
      },
    ]);
  });
});
