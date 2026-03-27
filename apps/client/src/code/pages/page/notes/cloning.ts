import type { Page } from '../page';

export class NoteCloning {
  readonly page: Page;

  constructor(input: { page: Page }) {
    this.page = input.page;
  }

  async perform(options?: { shiftNotes?: boolean }) {
    if (this.page.react.readOnly) {
      return;
    }

    // Serialize selection

    const serialObject = this.page.app.serialization.serialize(
      this.page.selection.react,
    );

    // Shift notes before deserialization

    if (options?.shiftNotes ?? true) {
      for (const noteIndex of serialObject.root.noteIdxs) {
        const serialNote = serialObject.notes[noteIndex];

        serialNote.pos.x += 8;
        serialNote.pos.y += 8;
      }
    }

    // Deserialize into structure

    let destIndex;
    const lastSelectedNote = this.page.selection.react.notes.at(-1);
    if (lastSelectedNote != null) {
      destIndex = lastSelectedNote.react.index + 1;
    }

    const destRegion = this.page.activeRegion.react.value;

    const { notes, arrows } = this.page.app.serialization.deserialize(
      serialObject,
      destRegion,
      destIndex,
    );

    // Select clones

    this.page.selection.set(...notes.concat(arrows));

    // Scroll into view

    if (this.page.selection.react.notes.length > 0) {
      await nextTick();

      this.page.selection.react.notes.at(-1)?.scrollIntoView();
    }
  }
}
