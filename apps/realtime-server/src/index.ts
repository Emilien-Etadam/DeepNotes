import './env';

import { mainLogger } from '@stdlib/misc';
import { httpServer } from 'src/http-server';

import './data/knex';

const moduleLogger = mainLogger.sub('index.ts');

httpServer().listen(Number.parseInt(process.env.REALTIME_SERVER_PORT), () => {
  moduleLogger.info(
    `realtime-server started on port ${process.env.REALTIME_SERVER_PORT}`,
  );
});
