import { useEventListener } from '@vueuse/core';
import {
  keyboardShortcuts,
  matchesShortcut,
  type ShortcutContext,
} from './keyboard-shortcut-map';

async function onKeyDown(event: KeyboardEvent): Promise<boolean> {
  mainLogger.info(`Keydown: ${event.code}`);

  const page = internals.pages?.react?.page;
  if (page == null) {
    return false;
  }

  const target = event.target as HTMLElement;
  const context: ShortcutContext = {
    isEditingElem:
      page.editing.react.active && Boolean(target.isContentEditable),
    isEditingInput:
      target.nodeName === 'INPUT' ||
      target.nodeName === 'TEXTAREA' ||
      target.isContentEditable,
    activeElem: page.activeElem.react.value,
  };

  for (const shortcut of keyboardShortcuts) {
    if (
      matchesShortcut(event, shortcut) &&
      (shortcut.when?.(page, context) ?? true)
    ) {
      await shortcut.action(page);
      return true;
    }
  }

  return false;
}

export function useKeyboardShortcuts() {
  useEventListener('keydown', async (event) => {
    if (await onKeyDown(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}
