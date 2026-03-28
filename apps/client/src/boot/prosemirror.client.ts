import { EditorView } from 'prosemirror-view';

import type { BootContext } from './boot-context';

// Prosemirror fix

const oldUpdateState = EditorView.prototype.updateState;

EditorView.prototype.updateState = function (state) {
  // This prevents the matchesNode error on hot reloads
  // @ts-ignore
  if (!this.docView) {
    return;
  }

  oldUpdateState.call(this, state);
};

export async function setup(_ctx: BootContext) {}
