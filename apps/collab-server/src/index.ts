import './env';

import { mainLogger } from '@stdlib/misc';

import './data/knex';
import { httpServer } from './http-server';

httpServer().listen(Number.parseInt(process.env.COLLAB_SERVER_PORT), () => {
  mainLogger
    .sub('index.ts')
    .info(`collab-server started on port ${process.env.COLLAB_SERVER_PORT}`);
});
