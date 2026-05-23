import type {
  makePrivateProcedureStep1,
  makePrivateProcedureStep2,
} from '@deepnotes/app-server/src/websocket/groups/privacy/make-private';
import { createWebsocketRequest } from 'src/code/utils/websocket-requests';

import { processGroupKeyRotationValues } from '../key-rotation';
import { apiWsUrl } from 'src/lib/endpoints';

function noopStep3(_input: unknown) {}

export async function makeGroupPrivate(input: { groupId: string }) {
  const { promise } = createWebsocketRequest({
    url: apiWsUrl('/groups.privacy.makePrivate'),

    steps: [step1, step2, noopStep3],
  });

  async function step1(): Promise<
    (typeof makePrivateProcedureStep1)['_def']['_input_in']
  > {
    return {
      groupId: input.groupId,
    };
  }

  async function step2(
    input_: (typeof makePrivateProcedureStep1)['_def']['_output_out'],
  ): Promise<(typeof makePrivateProcedureStep2)['_def']['_input_in']> {
    return await processGroupKeyRotationValues({
      ...input_,

      groupId: input.groupId,

      groupIsPublic: false,
    });
  }

  return promise;
}
