import { DataLayer } from '@stdlib/crypto';
import { bytesToText, textToBytes } from '@stdlib/misc';
import { createSmartComputedDict } from '@stdlib/vue';
import { once } from 'lodash';

import { pageGroupIds } from './page-group-id';
import { pageKeyrings } from './page-keyrings';
import { createPageTitles } from './page-titles-factory';

export const pageRelativeTitles = createPageTitles(
  {
    DataLayer,
    bytesToText,
    textToBytes,
    createSmartComputedDict,
    once,
    pageGroupIds,
    pageKeyrings,
  },
  {
    loggerKey: 'pageRelativeTitles',
    encryptedField: 'encrypted-relative-title',
    associatedDataContext: 'PageRelativeTitle',
  },
);
