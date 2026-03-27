import { once } from '@stdlib/misc';
import dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

const initProcessEnv = once(() => {
  const envFile = dotenv.config({ path: '../../.env' });
  let config = dotenv.config({ path: '../../.env.prod' });

  if (envFile.parsed?.DEV) {
    config = envFile.parsed?.PRODEV
      ? dotenv.config({ path: '../../.env.prodev' })
      : dotenv.config({ path: '../../.env.dev' });
  }

  dotenvExpand.expand(config);

  return process.env;
}, process.env);

export function initializeSharedEnv() {
  Object.defineProperty(process, 'env', {
    get: initProcessEnv,
  });
}

export function getDbConfig() {
  return {
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbName: process.env.DB_NAME,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
  };
}

export function getKeyDbConfig() {
  return {
    keyDbHost: process.env.KEYDB_HOST,
    keyDbPort: process.env.KEYDB_PORT,
    keyDbPassword: process.env.KEYDB_PASSWORD,
  };
}

export function getCommonConfig() {
  return {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  };
}
