import { DataSource } from 'typeorm';
import secretManagerConfig from '../src/custom-config/secret-manager.config';

const buildDataSource = async () => {
  const secrets = await secretManagerConfig();

  return new DataSource({
    type: secrets.database.type,
    host: secrets.database.host,
    username: secrets.database.username,
    password: secrets.database.password,
    database: secrets.database.database,
    entities: ['dist/entities/*.js'],
    migrations: ['dist/db/migrations/*.js'],
    logging: true,
  });
};

export default buildDataSource();
