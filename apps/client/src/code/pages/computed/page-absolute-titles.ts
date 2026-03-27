import { DataLayer } from '@stdlib/crypto';
import { bytesToText, textToBytes } from '@stdlib/misc';
import { createSmartComputedDict } from '@stdlib/vue';
import { once } from 'lodash';

import { pageGroupIds } from './page-group-id';
import { pageKeyrings } from './page-keyrings';
import { createPageTitles } from './page-titles-factory';

export const pageAbsoluteTitles = createPageTitles(
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
    loggerKey: 'pageAbsoluteTitles',
    encryptedField: 'encrypted-absolute-title',
    associatedDataContext: 'PageAbsoluteTitle',
  },
);
