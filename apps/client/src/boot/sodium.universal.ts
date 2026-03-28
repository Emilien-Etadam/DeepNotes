import sodium from 'libsodium-wrappers-sumo';

import type { BootContext } from './boot-context';

export async function setup(_ctx: BootContext) {
  await sodium.ready;
}
