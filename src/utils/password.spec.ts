import {
  generateHashPassword,
  generateSalt,
  validatePassword,
} from './password';

describe('password', () => {
  const password = 'saoifjwioefsdf';
  let salt;
  let hashedPassword;

  it('generate salt', async () => {
    const salt1 = await generateSalt();
    const salt2 = await generateSalt();

    expect(typeof salt1).toBe('string');
    expect(typeof salt2).toBe('string');
    expect(salt1).not.toEqual(salt2);
  });

  it('generate password', async () => {
    salt = await generateSalt();
    hashedPassword = await generateHashPassword(password, salt);

    expect(typeof hashedPassword).toBe('string');
  });

  it('validate password', async () => {
    salt = await generateSalt();
    hashedPassword = await generateHashPassword(password, salt);

    const result = await validatePassword(password, hashedPassword, salt);

    expect(result).toBeTruthy();
  });
});
