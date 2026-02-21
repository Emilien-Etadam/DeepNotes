import type { PageSnapshotInfo, PageSnapshotType } from '@deeplib/misc';
import type { DataAbstraction, DataTransaction } from '@stdlib/data';
import { addDays } from '@stdlib/misc';
import { nanoid } from 'nanoid';

import type { dataHashes } from './data-hashes';

export async function insertPageSnapshot(input: {
  dataAbstraction: DataAbstraction<typeof dataHashes>;

  pageId: string;
  authorId: string;

  encryptedSymmetricKey: Uint8Array;
  encryptedData: Uint8Array;

  type: PageSnapshotType;

  dtrx: DataTransaction;
}) {
  const pageSnapshotInfos: PageSnapshotInfo[] =
    await input.dataAbstraction.hget('page-snapshots', input.pageId, 'infos');

  const executor = input.dtrx.trx!;

  const pageSnapshot = await executor
    .insertInto('page_snapshots')
    .values({
      id: nanoid(),
      page_id: input.pageId,
      encrypted_symmetric_key: input.encryptedSymmetricKey,
      encrypted_data: input.encryptedData,
      author_id: input.authorId,
      type: input.type,
    } as any)
    .returning(['id', 'creation_date', 'author_id', 'type'])
    .executeTakeFirstOrThrow();

  // Add new snapshot

  pageSnapshotInfos.unshift({
    id: pageSnapshot.id,
    creationDate: pageSnapshot.creation_date,
    authorId: pageSnapshot.author_id,
    type: pageSnapshot.type,
  });

  // Trim excess snapshots

  const deletedSnapshotIds: string[] = [];

  while (
    pageSnapshotInfos.length > 10 &&
    new Date() > addDays(pageSnapshotInfos.at(-1)!.creationDate, 14)
  ) {
    deletedSnapshotIds.push(pageSnapshotInfos.pop()!.id);
  }

  if (deletedSnapshotIds.length > 0) {
    await executor
      .deleteFrom('page_snapshots')
      .where('id', 'in', deletedSnapshotIds)
      .execute();
  }

  // Update page snapshot infos

  await input.dataAbstraction.hmset(
    'page-snapshots',
    input.pageId,
    { infos: pageSnapshotInfos },
    { dtrx: input.dtrx },
  );
}
