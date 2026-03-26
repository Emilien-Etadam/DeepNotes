import type { Y } from '@syncedstore/core';
import { type Editor as EditorType, getSchema } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as tiptapModule from '@tiptap/vue-3';
import { once } from 'lodash';
import {
  prosemirrorJSONToYXmlFragment,
  yXmlFragmentToProseMirrorRootNode,
} from 'y-prosemirror';

import { extensions } from './extensions';

/** Schema partagé (rempli au premier éditeur créé ou à la première lecture de .schema) pour éviter "Duplicate use of selection JSON ID" et permettre la création de note sur page vide */
let cachedSchema: ReturnType<typeof getSchema> | null = null;

function ensureSchema(): NonNullable<typeof cachedSchema> {
  if (cachedSchema != null) return cachedSchema;
  cachedSchema = getSchema(extensions());
  return cachedSchema;
}

export function swapXmlFragments(frag1: Y.XmlFragment, frag2: Y.XmlFragment) {
  const schema = internals.tiptap().schema;
  if (!schema)
    throw new Error('swapXmlFragments: no schema (no editor created yet)');
  const json1 = yXmlFragmentToProseMirrorRootNode(frag1, schema).toJSON();
  const json2 = yXmlFragmentToProseMirrorRootNode(frag2, schema).toJSON();
  prosemirrorJSONToYXmlFragment(schema, json2, frag1);
  prosemirrorJSONToYXmlFragment(schema, json1, frag2);
}

function useEditorWithSchemaCache(
  options: Parameters<typeof tiptapModule.useEditor>[0],
) {
  const origOnCreate = options?.onCreate;
  return tiptapModule.useEditor({
    ...options,
    onCreate(evt: { editor: EditorType }) {
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
    return ensureSchema();
  },

  Collaboration,
  CollaborationCursor,

  swapXmlFragments,
}));

internals.tiptap = tiptap;
