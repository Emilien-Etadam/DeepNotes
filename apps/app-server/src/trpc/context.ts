import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { dataAbstraction } from 'src/data/data-abstraction';
import { getRedis } from 'src/data/redis';
import { usingLocks } from 'src/data/redlock';
import {
  assertCorrectGroupPassword,
  assertSufficientGroupPermissions,
} from 'src/utils/groups';
import {
  assertCorrectUserPassword,
  assertNonDemoAccount,
  assertUserSubscribed,
} from 'src/utils/users';

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  return {
    req,
    res,

    redis: getRedis(),
    dataAbstraction: (await dataAbstraction()),

    usingLocks,

    assertSufficientGroupPermissions,
    assertCorrectGroupPassword,

    assertCorrectUserPassword,
    assertUserSubscribed,
    assertNonDemoAccount,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
