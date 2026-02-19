import type { Y } from '@syncedstore/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as tiptapModule from '@tiptap/vue-3';
import type { Editor } from '@tiptap/core';
import { once } from 'lodash';
import {
  prosemirrorJSONToYXmlFragment,
  yXmlFragmentToProsemirrorJSON,
} from 'y-prosemirror';

import { extensions } from './extensions';

/** Schema partagé (rempli au premier éditeur créé) pour éviter "Duplicate use of selection JSON ID" */
let cachedSchema: ReturnType<typeof tiptapModule.getSchema> | null = null;

export function swapXmlFragments(frag1: Y.XmlFragment, frag2: Y.XmlFragment) {
  const schema = internals.tiptap().schema;
  if (!schema) throw new Error('swapXmlFragments: no schema (no editor created yet)');
  const json1 = yXmlFragmentToProsemirrorJSON(frag1);
  const json2 = yXmlFragmentToProsemirrorJSON(frag2);
  prosemirrorJSONToYXmlFragment(schema, json2, frag1);
  prosemirrorJSONToYXmlFragment(schema, json1, frag2);
}

function useEditorWithSchemaCache(
  options: Parameters<typeof tiptapModule.useEditor>[0],
) {
  const origOnCreate = options?.onCreate;
  return tiptapModule.useEditor({
    ...options,
    onCreate(evt: { editor: Editor }) {
      if (!cachedSchema) cachedSchema = evt.editor.schema;
      origOnCreate?.(evt);
    },
  });
}

export const tiptap = once(() => ({
  ...tiptapModule,
  useEditor: useEditorWithSchemaCache,

  extensions,
  get schema() {
    return cachedSchema;
  },

  Collaboration,
  CollaborationCursor,

  swapXmlFragments,
}));

internals.tiptap = tiptap;
