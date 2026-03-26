import { listenPointerEvents, Rect, Vec2 } from '@stdlib/misc';
import { isCtrlDown } from 'src/code/utils/misc';

import type { Page } from '../page';
import type { NoteSection, NoteSide, PageNote } from './note';

function applyResizeRectFromPointer(
  activeNote: PageNote,
  side: NoteSide,
  worldPos: Vec2,
) {
  const resizing = activeNote.react.resizing;
  if (resizing == null) return;

  if (side.includes('w')) {
    resizing.newResizeRect.topLeft.x = worldPos.x;
  }
  if (side.includes('n')) {
    resizing.newResizeRect.topLeft.y = worldPos.y;
  }
  if (side.includes('e')) {
    resizing.newResizeRect.bottomRight.x = worldPos.x;
  }
  if (side.includes('s')) {
    resizing.newResizeRect.bottomRight.y = worldPos.y;
  }
}

function applyCtrlResize(
  activeNote: PageNote,
  side: NoteSide,
  worldPos: Vec2,
) {
  const resizing = activeNote.react.resizing;
  if (resizing == null) return;
  const old = resizing.oldResizeRect;
  if (side.includes('w')) {
    resizing.newResizeRect.bottomRight.x =
      old.center.x + old.center.x - worldPos.x;
  }
  if (side.includes('n')) {
    resizing.newResizeRect.bottomRight.y =
      old.center.y + old.center.y - worldPos.y;
  }
  if (side.includes('e')) {
    resizing.newResizeRect.topLeft.x = old.center.x + old.center.x - worldPos.x;
  }
  if (side.includes('s')) {
    resizing.newResizeRect.topLeft.y = old.center.y + old.center.y - worldPos.y;
  }
}

function applySizeAndWorldRectToSelection(
  page: Page,
  side: NoteSide,
  posDiff: Vec2,
  sizeDiff: Vec2,
) {
  const activeNote = page.activeElem.react.value;
  if (activeNote?.type !== 'note' || activeNote.react.resizing == null) return;

  for (const selectedNote of page.selection.react.notes) {
    if (selectedNote.react.resizing == null) continue;

    selectedNote.react.resizing.active = true;

    if (side.includes('w') || side.includes('e')) {
      selectedNote.react.resizing.newResizeRect.size = new Vec2(
        activeNote.react.resizing.newResizeRect.size.x,
        selectedNote.react.resizing.newResizeRect.size.y,
      );
    }
    if (side.includes('n') || side.includes('s')) {
      selectedNote.react.resizing.newResizeRect.size = new Vec2(
        selectedNote.react.resizing.newResizeRect.size.x,
        activeNote.react.resizing.newResizeRect.size.y,
      );
    }

    const newWorldTopLeft =
      selectedNote.react.resizing.oldWorldRect.topLeft.add(posDiff);
    selectedNote.react.resizing.newWorldRect = new Rect(
      newWorldTopLeft,
      newWorldTopLeft.add(
        selectedNote.react.resizing.oldWorldRect.size.add(sizeDiff),
      ),
    );
  }
}

export class NoteResizing {
  readonly page: Page;

  side!: NoteSide;
  section!: NoteSection | null;

  constructor(input: { page: Page }) {
    this.page = input.page;
  }

  async start(
    event: PointerEvent,
    note: PageNote,
    side: NoteSide,
    section?: NoteSection,
  ) {
    if (this.page.react.readOnly) {
      return;
    }

    this.side = side;
    this.section = section ?? null;

    this.page.activeElem.set(note);

    for (const selectedNote of this.page.selection.react.notes) {
      const worldRect = selectedNote.getWorldRect('note-frame');

      if (worldRect == null) {
        continue;
      }

      let resizeRect;

      if (this.section != null && note.react.collab[this.section].enabled) {
        const sectionRect = note.getWorldRect(`note-${this.section}-section`);

        if (sectionRect == null) {
          continue;
        }

        resizeRect = new Rect(
          new Vec2(worldRect.topLeft.x, sectionRect.topLeft.y),
          new Vec2(worldRect.bottomRight.x, sectionRect.bottomRight.y),
        );
      } else {
        resizeRect = worldRect;
      }

      selectedNote.react.resizing = {
        oldWorldRect: new Rect(worldRect),
        newWorldRect: new Rect(worldRect),

        section,

        oldResizeRect: new Rect(resizeRect),
        newResizeRect: new Rect(resizeRect),
      };
    }

    listenPointerEvents(event, {
      move: this._update,
      up: this._finish,
    });
  }

  private _update = (event: PointerEvent) => {
    const activeNote = this.page.activeElem.react.value;

    if (activeNote?.type !== 'note' || activeNote.react.resizing == null) {
      return;
    }

    const worldPos = this.page.pos.eventToWorld(event);

    applyResizeRectFromPointer(activeNote, this.side, worldPos);
    if (isCtrlDown(event) || internals.mobileAltKey) {
      applyCtrlResize(activeNote, this.side, worldPos);
    }

    const posDiff = activeNote.react.resizing.newResizeRect.topLeft.sub(
      activeNote.react.resizing.oldResizeRect.topLeft,
    );
    const sizeDiff = activeNote.react.resizing.newResizeRect.size.sub(
      activeNote.react.resizing.oldResizeRect.size,
    );

    applySizeAndWorldRectToSelection(this.page, this.side, posDiff, sizeDiff);
  };

  private _finish = () => {
    for (const selectedNote of this.page.selection.react.notes) {
      if (selectedNote.react.resizing == null) {
        continue;
      }

      if (
        selectedNote.react.resizing.newResizeRect.size.x !==
        selectedNote.react.resizing.oldResizeRect.size.x
      ) {
        selectedNote.react.collab.width[selectedNote.react.sizeProp] =
          selectedNote.react.resizing.newResizeRect.size.x.toString();
      }

      if (
        selectedNote.react.resizing.section != null &&
        selectedNote.react.resizing.newResizeRect.size.y !==
          selectedNote.react.resizing.oldResizeRect.size.y
      ) {
        selectedNote.react.collab[selectedNote.react.resizing.section].height[
          selectedNote.react.sizeProp
        ] = selectedNote.react.resizing.newResizeRect.size.y.toString();
      }

      const anchor = new Vec2(selectedNote.react.collab.anchor);

      const posDiff = selectedNote.react.resizing.newWorldRect.topLeft
        .add(selectedNote.react.resizing.newWorldRect.size.mul(anchor))
        .sub(
          selectedNote.react.resizing.oldWorldRect.topLeft.add(
            selectedNote.react.resizing.oldWorldRect.size.mul(anchor),
          ),
        );

      const newPos = new Vec2(selectedNote.react.collab.pos).add(posDiff);

      selectedNote.react.collab.pos.x = newPos.x;
      selectedNote.react.collab.pos.y = newPos.y;

      selectedNote.react.resizing = undefined;
    }
  };

  fitContent(side: string, section: NoteSection) {
    this.page.selection.react.notes.forEach(async (note) => {
      const oldFrameRect = note.getWorldRect('note-frame');

      if (oldFrameRect == null) {
        return;
      }

      if (side.includes('n') || side.includes('s')) {
        note.react.collab[section].height[note.react.sizeProp] = 'Auto';
      }

      if (side.includes('w') || side.includes('e')) {
        note.react.collab.width[note.react.sizeProp] = 'Auto';
      }

      await nextTick();

      const newFrameRect = note.getWorldRect('note-frame');

      if (newFrameRect == null) {
        return;
      }

      const topLeftOffset = newFrameRect.topLeft.sub(oldFrameRect.topLeft);
      const bottomRightOffset = newFrameRect.bottomRight.sub(
        oldFrameRect.bottomRight,
      );

      if (side.includes('w')) {
        note.react.collab.pos.x -= bottomRightOffset.x;
      }

      if (side.includes('n')) {
        note.react.collab.pos.y -= bottomRightOffset.y;
      }

      if (side.includes('e')) {
        note.react.collab.pos.x -= topLeftOffset.x;
      }

      if (side.includes('s')) {
        note.react.collab.pos.y -= topLeftOffset.y;
      }
    });
  }
}
