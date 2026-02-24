import { Vec2 } from '@stdlib/misc';
import { unsetNode } from 'src/code/areas/tiptap/utils';
import type { Page } from 'src/code/pages/page/page';
import InsertImageDialog from 'src/layouts/PagesLayout/MainToolbar/InsertImageDialog.vue';
import InsertLinkDialog from 'src/layouts/PagesLayout/MainToolbar/InsertLinkDialog.vue';
import TakeScreenshotDialog from 'src/layouts/PagesLayout/MainToolbar/TakeScreenshotDialog.vue';

export interface ShortcutContext {
  isEditingElem: boolean;
  isEditingInput: boolean;
  activeElem: unknown;
}

export interface KeyboardShortcut {
  code: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: (page: Page) => void | Promise<void>;
  when?: (page: Page, context: ShortcutContext) => boolean;
}

export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut,
): boolean {
  const ctrlOrMeta = event.ctrlKey || event.metaKey;
  return (
    event.code === shortcut.code &&
    (shortcut.ctrl ?? false) === ctrlOrMeta &&
    (shortcut.shift ?? false) === event.shiftKey &&
    (shortcut.alt ?? false) === event.altKey
  );
}

function openInsertLinkDialog(): void {
  $quasar().dialog({ component: InsertLinkDialog });
}

function openInsertImageDialog(): void {
  $quasar().dialog({ component: InsertImageDialog });
}

function openTakeScreenshotDialog(): void {
  $quasar().dialog({ component: TakeScreenshotDialog });
}

function handleInsertYoutubeVideo(page: Page): void {
  $quasar()
    .dialog({
      title: 'Insert YouTube video',
      message: 'Enter the video URL:',
      prompt: {
        type: 'url',
        model: '',
        filled: true,
      },
      color: 'primary',
      cancel: { flat: true, color: 'negative' },
      focus: 'cancel',
    })
    .onOk((url: string) =>
      page.selection.format((chain) =>
        chain.setYoutubeVideo({
          src: url,
        }),
      ),
    );
}

export const keyboardShortcuts: KeyboardShortcut[] = [
  // --- Editing only (isEditingElem) ---
  {
    code: 'Escape',
    action: (page) => page.editing.stop(),
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'Space',
    ctrl: true,
    action: (page) =>
      page.selection.format((chain) => chain.clearNodes().unsetAllMarks()),
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'Digit1',
    alt: true,
    action: (page) =>
      page.selection.format((chain) => chain.toggleHeading({ level: 1 })),
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'Digit2',
    alt: true,
    action: (page) =>
      page.selection.format((chain) => chain.toggleHeading({ level: 2 })),
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'Digit3',
    alt: true,
    action: (page) =>
      page.selection.format((chain) => chain.toggleHeading({ level: 3 })),
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'Digit3',
    alt: true,
    action: (page) =>
      page.selection.format((chain, editor) =>
        unsetNode(editor, chain, 'heading'),
      ),
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'KeyK',
    ctrl: true,
    action: openInsertLinkDialog,
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'KeyK',
    ctrl: true,
    shift: true,
    action: (page) => page.selection.format((chain) => chain.unsetMark('link')),
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'KeyM',
    ctrl: true,
    action: (page) => page.selection.format((chain) => chain.addInlineMath()),
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'KeyM',
    ctrl: true,
    shift: true,
    action: (page) => page.selection.format((chain) => chain.addMathBlock()),
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'KeyQ',
    alt: true,
    shift: true,
    action: (page) =>
      page.selection.format((chain) => chain.toggleBlockquote()),
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'KeyC',
    alt: true,
    shift: true,
    action: (page) => page.selection.format((chain) => chain.toggleCodeBlock()),
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'KeyR',
    alt: true,
    shift: true,
    action: (page) =>
      page.selection.format((chain) => chain.setHorizontalRule()),
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'KeyI',
    alt: true,
    shift: true,
    action: openInsertImageDialog,
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'KeyY',
    alt: true,
    shift: true,
    action: handleInsertYoutubeVideo,
    when: (_, ctx) => ctx.isEditingElem,
  },
  {
    code: 'KeyT',
    alt: true,
    shift: true,
    action: (page) =>
      page.selection.format((chain) =>
        chain.insertTable({
          rows: 3,
          cols: 3,
          withHeaderRow: false,
        }),
      ),
    when: (_, ctx) => ctx.isEditingElem,
  },
  // --- Find & replace ---
  {
    code: 'Escape',
    action: (page) => {
      page.findAndReplace.react.active = false;
    },
    when: (page) => page.findAndReplace.react.active,
  },
  {
    code: 'F3',
    action: (page) => page.findAndReplace.findNext(),
    when: (page) => page.findAndReplace.react.active,
  },
  {
    code: 'F3',
    shift: true,
    action: (page) => page.findAndReplace.findPrev(),
    when: (page) => page.findAndReplace.react.active,
  },
  {
    code: 'KeyF',
    ctrl: true,
    action: (page) => {
      page.findAndReplace.react.active =
        !page.findAndReplace.react.active || page.findAndReplace.react.replace;
      page.findAndReplace.react.replace = false;
    },
  },
  {
    code: 'KeyH',
    ctrl: true,
    action: (page) => {
      page.findAndReplace.react.active =
        !page.findAndReplace.react.active || !page.findAndReplace.react.replace;
      page.findAndReplace.react.replace = true;
    },
    when: (_, ctx) => !ctx.isEditingElem,
  },
  // --- Non-editing input only (!isEditingInput) ---
  {
    code: 'KeyX',
    ctrl: true,
    action: (page) => page.clipboard.cut(),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyC',
    ctrl: true,
    action: (page) => page.clipboard.copy(),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyV',
    ctrl: true,
    action: (page) => page.clipboard.paste(),
    when: (_, ctx) => !ctx.isEditingInput && !!globalThis.clipboardData,
  },
  {
    code: 'KeyD',
    ctrl: true,
    action: (page) => page.cloning.perform(),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyZ',
    ctrl: true,
    action: (page) => page.undoRedo.undo(),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyY',
    ctrl: true,
    action: (page) => page.undoRedo.redo(),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyA',
    ctrl: true,
    action: (page) => page.selection.selectAll(),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'Delete',
    action: (page) => page.deleting.perform(),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyS',
    alt: true,
    shift: true,
    action: openTakeScreenshotDialog,
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyB',
    ctrl: true,
    action: (page) => page.selection.toggleMark('bold'),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyI',
    ctrl: true,
    action: (page) => page.selection.toggleMark('italic'),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyX',
    ctrl: true,
    shift: true,
    action: (page) => page.selection.toggleMark('strike'),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyU',
    ctrl: true,
    action: (page) => page.selection.toggleMark('underline'),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'Space',
    ctrl: true,
    action: (page) =>
      page.selection.format((chain) => chain.clearNodes().unsetAllMarks()),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyL',
    ctrl: true,
    shift: true,
    action: (page) =>
      page.selection.format((chain) => chain.setTextAlign('left')),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyE',
    ctrl: true,
    shift: true,
    action: (page) =>
      page.selection.format((chain) => chain.setTextAlign('center')),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyR',
    ctrl: true,
    shift: true,
    action: (page) =>
      page.selection.format((chain) => chain.setTextAlign('right')),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyJ',
    ctrl: true,
    shift: true,
    action: (page) =>
      page.selection.format((chain) => chain.setTextAlign('justify')),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyH',
    ctrl: true,
    shift: true,
    action: (page) => page.selection.format((chain) => chain.toggleHighlight()),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'Comma',
    ctrl: true,
    action: (page) => page.selection.toggleMark('subscript'),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'Period',
    ctrl: true,
    action: (page) => page.selection.toggleMark('superscript'),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyK',
    ctrl: true,
    action: openInsertLinkDialog,
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyK',
    ctrl: true,
    shift: true,
    action: (page) => page.selection.format((chain) => chain.unsetMark('link')),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyE',
    ctrl: true,
    action: (page) => page.selection.toggleMark('code'),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'Digit1',
    alt: true,
    action: (page) => page.selection.toggleNode('heading', { level: 1 }),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'Digit2',
    alt: true,
    action: (page) => page.selection.toggleNode('heading', { level: 2 }),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'Digit3',
    alt: true,
    action: (page) => page.selection.toggleNode('heading', { level: 3 }),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'Digit0',
    alt: true,
    action: (page) =>
      page.selection.format((chain, editor) =>
        unsetNode(editor, chain, 'heading'),
      ),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'Digit7',
    ctrl: true,
    shift: true,
    action: (page) =>
      page.selection.format((chain) => chain.toggleOrderedList()),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'Digit8',
    ctrl: true,
    shift: true,
    action: (page) =>
      page.selection.format((chain) => chain.toggleBulletList()),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'Digit9',
    ctrl: true,
    shift: true,
    action: (page) => page.selection.format((chain) => chain.toggleTaskList()),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyQ',
    alt: true,
    shift: true,
    action: (page) =>
      page.selection.format((chain) => chain.toggleBlockquote()),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'KeyC',
    alt: true,
    shift: true,
    action: (page) => page.selection.format((chain) => chain.toggleCodeBlock()),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'F2',
    action: async (page) => {
      const elem = page.activeElem.react.value;
      if (elem != null) await page.editing.start(elem);
    },
    when: (_, ctx) => !ctx.isEditingInput && ctx.activeElem != null,
  },
  {
    code: 'Backspace',
    action: () => internals.pages.goBackward(),
    when: (_, ctx) => !ctx.isEditingInput && ctx.activeElem == null,
  },
  {
    code: 'Backspace',
    action: async (page) => {
      const elem = page.activeElem.react.value;
      if (elem != null) {
        await page.editing.start(elem);
        page.editing.react.editor?.commands.deleteSelection();
      }
    },
    when: (_, ctx) => !ctx.isEditingInput && ctx.activeElem != null,
  },
  {
    code: 'ArrowLeft',
    action: (page) =>
      page.selection.shift(new Vec2(-(1 / page.camera.react.zoom), 0)),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'ArrowRight',
    action: (page) =>
      page.selection.shift(new Vec2(1 / page.camera.react.zoom, 0)),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'ArrowUp',
    action: (page) =>
      page.selection.shift(new Vec2(0, -(1 / page.camera.react.zoom))),
    when: (_, ctx) => !ctx.isEditingInput,
  },
  {
    code: 'ArrowDown',
    action: (page) =>
      page.selection.shift(new Vec2(0, 1 / page.camera.react.zoom)),
    when: (_, ctx) => !ctx.isEditingInput,
  },
];
