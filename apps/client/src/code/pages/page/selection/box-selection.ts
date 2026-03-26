import { listenPointerEvents, Rect, Vec2 } from '@stdlib/misc';
import type { ComputedRef, UnwrapNestedRefs } from 'vue';

import type { Page } from '../page';
import type { PageRegion } from '../regions/region';

function getBoxClientRect(clientStartPos: Vec2, clientEndPos: Vec2): Rect {
  return new Rect(
    new Vec2(
      Math.min(clientStartPos.x, clientEndPos.x),
      Math.min(clientStartPos.y, clientEndPos.y),
    ),
    new Vec2(
      Math.max(clientStartPos.x, clientEndPos.x),
      Math.max(clientStartPos.y, clientEndPos.y),
    ),
  );
}

function processNotesInBox(
  page: Page,
  region: ComputedRef<PageRegion>,
  boxClientRect: Rect,
  event: PointerEvent,
) {
  const regionValue = region.value;
  for (const note of regionValue.react.notes) {
    if (note == null) continue;
    const noteClientRect = note.getClientRect('note-frame');
    if (noteClientRect == null) continue;
    if (!boxClientRect.intersectsRect(noteClientRect)) continue;
    if (note.react.selected && !event.shiftKey && !internals.mobileAltKey) {
      page.selection.remove(note);
    } else {
      page.selection.add(note);
    }
  }
}

function processArrowsInBox(
  page: Page,
  region: ComputedRef<PageRegion>,
  boxClientRect: Rect,
  event: PointerEvent,
) {
  const regionValue = region.value;
  for (const arrow of regionValue.react.arrows) {
    if (arrow == null) continue;
    const arrowClientRect = arrow.getClientRect();
    if (arrowClientRect == null) continue;
    if (!boxClientRect.containsVec2(arrowClientRect.center)) continue;
    if (
      arrow.react.selected &&
      !event.shiftKey &&
      !internals.mobileAltKey
    ) {
      page.selection.remove(arrow);
    } else {
      page.selection.add(arrow);
    }
  }
}

export interface IBoxSelectionReact {
  active: boolean;

  regionId?: string;
  region: ComputedRef<PageRegion>;

  clientStartPos: Vec2;
  clientEndPos: Vec2;

  displayRect: ComputedRef<Rect>;
}

export class PageBoxSelection {
  readonly page: Page;

  readonly react: UnwrapNestedRefs<IBoxSelectionReact>;

  private _cancelPointerEvents?: () => void;

  constructor(input: { page: Page }) {
    this.page = input.page;

    this.react = reactive({
      active: false,

      region: computed(() => this.page.regions.fromId(this.react.regionId!)),

      clientStartPos: new Vec2(),
      clientEndPos: new Vec2(),

      displayRect: computed(() =>
        this.page.rects.clientToDisplay(
          new Rect(this.react.clientStartPos, this.react.clientEndPos),
        ),
      ),
    });
  }

  start(event: PointerEvent, region: PageRegion) {
    const clientPos = this.page.pos.eventToClient(event);

    this.react.active = false;

    this.react.regionId = region.id;

    this.react.clientStartPos = new Vec2(clientPos);
    this.react.clientEndPos = new Vec2(clientPos);

    if (event.pointerType === 'mouse') {
      this._cancelPointerEvents = listenPointerEvents(event, {
        dragStartDistance: 5,

        dragStart: this._dragStart,
        dragUpdate: this._dragUpdate,
        dragEnd: this._dragEnd,
      });
    } else {
      this._cancelPointerEvents = listenPointerEvents(event, {
        dragStartDistance: 5,
        dragStartDelay: 300,

        dragCancel: this._dragCancel,
        dragStart: this._dragStart,
        dragUpdate: this._dragUpdate,
        dragEnd: this._dragEnd,
      });
    }
  }

  private readonly _dragCancel = (event: PointerEvent, external: boolean) => {
    this.react.active = false;

    if (!external) {
      this.page.panning.start(event);
    }
  };

  private readonly _dragStart = () => {
    this.react.active = true;
  };

  private readonly _dragUpdate = (event: PointerEvent) => {
    this.react.clientEndPos = this.page.pos.eventToClient(event);
  };

  private readonly _dragEnd = (event: PointerEvent) => {
    this.react.active = false;

    const boxClientRect = getBoxClientRect(
      this.react.clientStartPos,
      this.react.clientEndPos,
    );

    this.page.collab.doc.transact(() => {
      processNotesInBox(this.page, this.react.region, boxClientRect, event);
      processArrowsInBox(this.page, this.react.region, boxClientRect, event);
    });
  };

  cancel() {
    this.react.active = false;

    this._cancelPointerEvents?.();
  }
}
