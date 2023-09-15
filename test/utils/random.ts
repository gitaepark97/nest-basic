const alphabet = 'abcdefghijklmnopqrstuvwxyz';

export const createRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
};

export const createRandomString = (n: number): string => {
  let str = '';
  const k = alphabet.length;

  for (let i = 0; i < n; i++) {
    str += alphabet[createRandomInt(0, k - 1)];
  }

  return str;
};

export const createRandomEmail = (): string =>
  `${createRandomString(6)}@email.com`;
