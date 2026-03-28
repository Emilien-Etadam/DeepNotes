import messages from 'src/i18n';
import { createI18n } from 'vue-i18n';

import type { BootContext } from './boot-context';

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
declare module 'vue-i18n' {
  // define the locale messages schema (same as MessageSchema, inlined to avoid redundant alias)
  export type DefineLocaleMessage = (typeof messages)['en-US'];

  // define the datetime format schema
  export type DefineDateTimeFormat = Record<string, unknown>;

  // define the number format schema
  export type DefineNumberFormat = Record<string, unknown>;
}

export async function setup({ app }: BootContext) {
  const i18n = createI18n({
    locale: 'en-US',
    legacy: false,
    messages,
  });

  // Set i18n instance on app
  app.use(i18n);
}
