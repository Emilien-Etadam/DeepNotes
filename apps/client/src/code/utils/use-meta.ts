import { useHead } from '@unhead/vue';
import { isString } from 'lodash';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { APP_URL } from 'src/code/utils/app-url';

export type MetaTagDef = {
  name?: string;
  property?: string;
  content?: string;
};

export type MetaOptions = {
  title?: string;
  meta?: Record<string, MetaTagDef | undefined>;
};

export function useMeta(options: MetaOptions | (() => MetaOptions)) {
  const route = useRoute();

  useHead(
    computed(() => {
      const optionsObj =
        typeof options === 'function' ? options() : { ...options };

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

      const desc = optionsObj.meta?.description?.content;
      if (isString(desc)) {
        optionsObj.meta['og:description'] = {
          name: 'og:description',
          content: desc,
        };
        optionsObj.meta['twitter:description'] = {
          name: 'twitter:description',
          content: desc,
        };
      }

      const metaInput = Object.values(optionsObj.meta).filter(
        (m): m is MetaTagDef => m != null && typeof m === 'object',
      );

      return {
        title: optionsObj.title,
        meta: metaInput.map((m) => ({
          name: m.name,
          property: m.property,
          content: m.content,
        })),
      };
    }),
  );
}
