import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import type { Database } from './db-types';

export type KyselyDB = Kysely<Database>;

function getSslConfig(): { ca: string } | undefined {
  const caCert = process.env.POSTGRES_CA_CERTIFICATE;
  if (!caCert) return undefined;
  return { ca: Buffer.from(caCert, 'base64').toString('utf-8') };
}

/**
 * Creates a Kysely instance for PostgreSQL using the same env vars as knex:
 * POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE, POSTGRES_CA_CERTIFICATE
 */
export function createKysely(): KyselyDB {
  const dialect = new PostgresDialect({
    pool: new Pool({
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number.parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
      user: process.env.POSTGRES_USER ?? '',
      password: process.env.POSTGRES_PASSWORD ?? '',
      database: process.env.POSTGRES_DATABASE ?? '',
      ssl: getSslConfig(),
      max: 10,
    }),
  });

  return new Kysely<Database>({ dialect });
}
