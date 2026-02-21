import './env';

import { decryptUserEmail, hashUserEmail } from '@deeplib/data';
import {
  sendBrevoMail,
  sendMailjetMail,
  sendSendGridMail,
} from '@deeplib/mail';
import { mainLogger } from '@stdlib/misc';
import { sql } from 'kysely';
import readline from 'node:readline';

import { dataAbstraction } from './data/data-abstraction';
import './data/knex';

const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function showHelp() {
  console.log('Available commands:');
  console.log('- hget <prefix> <suffix> <field>');
  console.log('- hset <prefix> <suffix> <field> <value>');
  console.log('- delete-user <userId>');
  console.log('- hash-email <email>');
  console.log('- send-sendgrid-test-mail <from> <to>');
  console.log('- send-brevo-test-mail <from> <to>');
  console.log('- send-mailjet-test-mail <from> <to>');
  console.log('Enter your commands:');
}

async function handleCommand(command: string) {
  const [commandName, ...args] = command.split(' ');

  try {
    switch (commandName) {
      case 'help':
        showHelp();
        break;
      case 'hget':
        mainLogger.info(
          `Result: ${await dataAbstraction().hget(
            args[0] as any,
            args[1],
            args[2],
          )}`,
        );
        break;
      case 'hset': {
        let value: unknown;
        try {
          value = JSON.parse(args[3]);
        } catch {
          mainLogger.error(
            'Value must be valid JSON (e.g. "string", number, true, false, null).',
          );
          return;
        }
        await dataAbstraction().hmset(args[0] as any, args[1], {
          [args[2]]: value,
        });
        break;
      }

      case 'delete-user':
        await deleteUser(args[0]);
        break;

      case 'hash-email':
        mainLogger.info(
          String.raw`Result: '\x${Buffer.from(hashUserEmail(args[0])).toString('hex')}'`,
        );
        break;

      case 'send-sendgrid-test-mail':
        await sendSendGridMail({
          from: { name: 'DeepNotes', email: args[0] },
          to: [args[1]],

          subject: 'SendGrid test mail',
          html: 'SendGrid test mail',
        });
        break;
      case 'send-brevo-test-mail':
        await sendBrevoMail({
          from: { name: 'DeepNotes', email: args[0] },
          to: [args[1]],

          subject: 'Brevo test mail',
          html: 'Brevo test mail',
        });
        break;
      case 'send-mailjet-test-mail':
        await sendMailjetMail({
          from: { name: 'DeepNotes', email: args[0] },
          to: [args[1]],

          subject: 'Mailjet test mail',
          html: 'Mailjet test mail',
        });
        break;
      default:
        mainLogger.error('Command unknown.');
        return;
    }

    mainLogger.info('Command executed successfully.');
  } catch (error) {
    mainLogger.error('Command failed with error: %o', error);
  }
}

async function deleteUser(userId: string) {
  await dataAbstraction().transaction(async (dtrx) => {
    const trx = dtrx.trx!;

    // Check if any group has more than one member

    const memberships = await trx
      .selectFrom('group_members')
      .where('user_id', '=', userId)
      .select([
        'group_id',
        sql<number>`(SELECT count(*)::int FROM group_members gm2 WHERE gm2.group_id = group_members.group_id)`.as(
          'member_count',
        ),
        sql<number>`(SELECT count(*)::int FROM group_members gm3 WHERE gm3.group_id = group_members.group_id AND gm3.role = 'owner')`.as(
          'owner_count',
        ),
      ])
      .execute();

    if (
      memberships.some(
        (count) =>
          count.member_count > 1 && count.owner_count <= 1,
      )
    ) {
      throw new Error(
        'Some groups would be left without an owner. Transfer ownership before deleting your account.',
      );
    }

    const idsOfGroupsToDelete = memberships
      .filter((membership) => membership.member_count <= 1)
      .map((membership) => membership.group_id);

    // Get all user data

    const [
      groupPageIds,
      invitations,
      requests,
      visitedPageIds,
      sessions,
      user,
    ] = await Promise.all([
      trx
        .selectFrom('pages')
        .where('group_id', 'in', idsOfGroupsToDelete)
        .select('id')
        .execute(),

      trx
        .selectFrom('group_join_invitations')
        .where('user_id', '=', userId)
        .select('group_id')
        .execute(),
      trx
        .selectFrom('group_join_requests')
        .where('user_id', '=', userId)
        .select('group_id')
        .execute(),

      trx
        .selectFrom('users_pages')
        .where('user_id', '=', userId)
        .select('page_id')
        .execute(),

      trx
        .selectFrom('sessions')
        .where('user_id', '=', userId)
        .where('invalidated', '=', false)
        .select('id')
        .execute(),

      trx
        .selectFrom('users')
        .where('id', '=', userId)
        .select(['encrypted_email', 'personal_group_id', 'customer_id'])
        .executeTakeFirst(),
    ]);

    if (user == null) {
      throw new Error('User not found');
    }

    // Delete all user data

    await Promise.all([
      ...groupPageIds.map((page) =>
        dataAbstraction().delete('page', page.id, {
          dtrx,
          cacheOnly: true,
        }),
      ),

      ...invitations.map((invitation) =>
        dataAbstraction().delete(
          'group-join-invitation',
          `${invitation.group_id}:${userId}`,
          { dtrx, cacheOnly: true },
        ),
      ),
      ...requests.map((request) =>
        dataAbstraction().delete(
          'group-join-request',
          `${request.group_id}:${userId}`,
          { dtrx, cacheOnly: true },
        ),
      ),
      ...memberships.map((member) =>
        dataAbstraction().delete(
          'group-member',
          `${member.group_id}:${userId}`,
          {
            dtrx,
            cacheOnly: true,
          },
        ),
      ),

      ...idsOfGroupsToDelete.map((groupId) =>
        dataAbstraction().delete('group', groupId, {
          dtrx,
        }),
      ),

      ...visitedPageIds.map((page) =>
        dataAbstraction().delete('user-page', `${userId}:${page.page_id}`, {
          dtrx,
          cacheOnly: true,
        }),
      ),

      ...sessions.map((session) =>
        dataAbstraction().patch(
          'session',
          session.id,
          { invalidated: true },
          { dtrx, cacheOnly: true },
        ),
      ),

      ...(user.customer_id == null
        ? []
        : [
            dataAbstraction().delete('customer', user.customer_id, {
              dtrx,
              cacheOnly: true,
            }),
          ]),

      dataAbstraction().delete(
        'email',
        decryptUserEmail(user.encrypted_email),
        {
          dtrx,
          cacheOnly: true,
        },
      ),

      dataAbstraction().delete('user', userId, { dtrx }),
    ]);
  });
}

function requestCommand() {
  readlineInterface.question('', async (command) => {
    if (command === 'exit') {
      readlineInterface.close();
      return;
    }

    await handleCommand(command);

    requestCommand();
  });
}

showHelp();

requestCommand();
