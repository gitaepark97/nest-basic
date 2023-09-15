import * as bcrypt from 'bcryptjs';

export const generateSalt = (): Promise<string> => bcrypt.genSalt();

export const generateHashPassword = (
  password: string,
  salt: string,
): Promise<string> => bcrypt.hash(password, salt);

export const validatePassword = async (
  inputPassword: string,
  hashPassword: string,
  salt: string,
): Promise<boolean> => {
  const inputHashPassword = await generateHashPassword(inputPassword, salt);

  return inputHashPassword === hashPassword;
};
