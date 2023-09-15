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

  return {
    port: Number(secrets.PORT),
    database: {
      type: secrets.DB_TYPE,
      host: secrets.DB_HOST,
      username: secrets.DB_USERNAME,
      password: secrets.DB_PASSWORD,
      database: secrets.DB_DATABASE,
    },
  };
};