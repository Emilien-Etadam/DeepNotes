import { once } from '@stdlib/misc';
import dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

Object.defineProperty(process, 'env', {
  get: once(() => {
    const baseEnv = dotenv.config({ path: '../../.env' }).parsed;
    let envConfig;
    if (baseEnv?.DEV) {
      envConfig = baseEnv?.PRODEV
        ? dotenv.config({ path: '../../.env.prodev' })
        : dotenv.config({ path: '../../.env.dev' });
    } else {
      envConfig = dotenv.config({ path: '../../.env.prod' });
    }

    dotenvExpand.expand(
      envConfig,
    );

    return process.env;
  }, process.env),
});
