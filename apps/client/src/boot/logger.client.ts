export { mainLogger } from '@stdlib/misc';
import { mainLogger as _mainLogger } from '@stdlib/misc';

_mainLogger.operations.unshift(
  () => !!process.env.DEV || !!process.env.STAGING,
);
