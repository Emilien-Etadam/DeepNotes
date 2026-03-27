import { initializeSharedEnv } from '@deeplib/misc';

export { getDbConfig, getKeyDbConfig, getCommonConfig } from '@deeplib/misc';

initializeSharedEnv();

export function getAppServerConfig() {
  return {
    appServerPort: process.env.APP_SERVER_PORT,
  };
}
