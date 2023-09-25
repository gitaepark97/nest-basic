import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

const fetchSecrets = async () => {
  const configService = new ConfigService();
  const secretName = configService.get('AWS_SECRET_NAME');
  const region = configService.get('AWS_REGION');

  const client = new SecretsManagerClient({
    region,
  });

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      }),
    );

    return JSON.parse(response.SecretString);
  } catch (err) {
    throw err;
  }
};

export default async () => {
  const secrets = await fetchSecrets();

  console.log(secrets);

  return {
    port: Number(secrets.PORT),
    database: {
      type: secrets.DB_TYPE,
      port: secrets.DB_PORT,
      host: secrets.DB_HOST,
      username: secrets.DB_USERNAME,
      password: secrets.DB_PASSWORD,
      database: secrets.DB_DATABASE,
    },
    jwt: {
      secret: secrets.JWT_SECRET,
      accessExpiresIn: secrets.ACCESS_EXPIRES_IN,
      refreshExpiresIn: secrets.REFRESH_EXPIRES_IN,
    },
  };
};
