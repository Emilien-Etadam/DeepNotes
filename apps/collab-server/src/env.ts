import { initializeSharedEnv } from '@deeplib/misc';

export { getDbConfig, getKeyDbConfig, getCommonConfig } from '@deeplib/misc';

initializeSharedEnv();

export function getCollabServerConfig() {
  return {
    collabServerPort: process.env.COLLAB_SERVER_PORT,
  };
}
