import { hashPassword } from '.';

describe('Share utils', () => {
  it('hashPassword', () => {
    const pwd = '123';
    const hashOf123 =
      '6d6cd63284be4a47ba7aec4a3458939a95dcbdd5cd0438f23d7457099b4b917c';
    expect(hashPassword(pwd)).toBe(hashOf123);
  });
});
