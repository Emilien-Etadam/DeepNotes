import { initializeSharedEnv } from '@deeplib/misc';

export { getDbConfig, getKeyDbConfig, getCommonConfig } from '@deeplib/misc';

initializeSharedEnv();

export function getRealtimeServerConfig() {
  return {
    realtimeServerPort: process.env.REALTIME_SERVER_PORT,
  };
}
