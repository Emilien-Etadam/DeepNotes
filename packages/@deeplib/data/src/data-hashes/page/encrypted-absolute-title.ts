import type { PageModel } from '@deeplib/db';
import type { DataField } from '@stdlib/data';

import { createEncryptedTitleField } from './encrypted-title-factory';

export const encryptedAbsoluteTitle: DataField<PageModel> =
  createEncryptedTitleField('absolute');
