import { isString } from 'lodash';
import { APP_URL } from 'src/code/utils/app-url';
import { useMeta as _useMeta } from 'quasar';
import type { MetaOptions } from 'quasar/dist/types/meta';

export function useMeta(options: MetaOptions | (() => MetaOptions)) {
  const optionsFunc = typeof options === 'function' ? options : () => options;

  const route = useRoute();

  _useMeta(() => {
    const optionsObj = optionsFunc();

    optionsObj.meta ??= {};

    optionsObj.meta['og:url'] = {
      name: 'og:url',
      content: `${APP_URL}${route.fullPath}`,
    };
    optionsObj.meta['twitter:url'] = {
      name: 'twitter:url',
      content: `${APP_URL}${route.fullPath}`,
    };

    if (isString(optionsObj.title)) {
      optionsObj.meta['og:title'] = {
        name: 'og:title',
        content: optionsObj.title,
      };
      optionsObj.meta['twitter:title'] = {
        name: 'twitter:title',
        content: optionsObj.title,
      };
    }

    if (isString(optionsObj.meta?.description?.content)) {
      optionsObj.meta['og:description'] = {
        name: 'og:description',
        content: optionsObj.meta.description.content,
      };
      optionsObj.meta['twitter:description'] = {
        name: 'twitter:description',
        content: optionsObj.meta.description.content,
      };
    }

    return optionsObj;
  });
}
