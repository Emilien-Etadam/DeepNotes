export { mainLogger } from '@stdlib/misc';
import { mainLogger as _mainLogger } from '@stdlib/misc';

import type { BootContext } from './boot-context';

_mainLogger.operations.unshift(
  () => !!process.env.DEV || !!process.env.STAGING,
);

export async function setup(_ctx: BootContext) {}
