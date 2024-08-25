import { useRef, useState, type MouseEvent } from "react";

// constants
import {
  ACTIVE_CURSOR_DATA_ATTR,
  ACTIVE_SELECTION_ID_ATTR,
} from "../constants";

// types
import { Selection, SelectionId } from "@/types/selection.type";
import { DIRECTION } from "../types";

export const DEFAULT_RESIZE_CURSORS = ["row-resize", "col-resize"] as const;
export const DEFAULT_RESIZE_CORNER_CURSORS = [
  "nwse-resize",
  "nesw-resize",
] as const;
const FLIPPED_RESIZE_CORNER_CURSORS = ["nesw-resize", "nwse-resize"] as const;

// HOOKS
export const useCursor = (activeSelectionId: SelectionId | null) => {
  const [activeCursor, setActiveCursor] = useState<string | null>(null);
  const recordCursorActive = useRef<boolean>(false);

  const onTriggerActiveCursor = (e: MouseEvent) => {
    recordCursorActive.current = true;
    const activeCursor = (e.target as HTMLElement).getAttribute(
      ACTIVE_CURSOR_DATA_ATTR,
    );
    if (activeCursor) {
      setActiveCursor(activeCursor);
    }
  };

  const onUpdateResizeCornerCursor = (e: MouseEvent) => {
    if (!recordCursorActive.current) return;
    if (!activeCursor) return;

    const isCorner = checkIsCornerCursor(activeCursor);
    if (!isCorner) return;

    const target = e.target as HTMLElement;

    const selectionId = target.getAttribute(ACTIVE_SELECTION_ID_ATTR);
    const isHoveringActiveSelection = selectionId === activeSelectionId;
    if (!isHoveringActiveSelection) return;

    const updateActiveCursor = target.getAttribute(ACTIVE_CURSOR_DATA_ATTR);
    if (!updateActiveCursor) return;

    const willBeCorner = checkIsCornerCursor(updateActiveCursor);
    if (!willBeCorner) return;

    setActiveCursor(updateActiveCursor);
  };

  const resetActiveCursor = () => {
    recordCursorActive.current = false;
    setActiveCursor(null);
  };

  return {
    activeCursor,
    onTriggerActiveCursor,
    onUpdateResizeCornerCursor,
    resetActiveCursor: resetActiveCursor,
  };
};

// UTILS
export function getResizerCursors(selection: Selection) {
  const fromTopLeft =
    selection.startX < selection.endX && selection.startY < selection.endY;
  const fromBottonRight =
    selection.startX > selection.endX && selection.startY > selection.endY;

  const isNormal = fromTopLeft || fromBottonRight;

  const cursors = isNormal
    ? DEFAULT_RESIZE_CORNER_CURSORS
    : FLIPPED_RESIZE_CORNER_CURSORS;

  const cursorsByPosition = {
    [DIRECTION.TOP_LEFT]: cursors[0],
    [DIRECTION.BOTTOM_RIGHT]: cursors[0],
    [DIRECTION.TOP_RIGHT]: cursors[1],
    [DIRECTION.BOTTOM_LEFT]: cursors[1],
    [DIRECTION.TOP]: DEFAULT_RESIZE_CURSORS[0],
    [DIRECTION.BOTTOM]: DEFAULT_RESIZE_CURSORS[0],
    [DIRECTION.LEFT]: DEFAULT_RESIZE_CURSORS[1],
    [DIRECTION.RIGHT]: DEFAULT_RESIZE_CURSORS[1],
  } as const;

  return cursorsByPosition;
}

const checkIsCornerCursor = (c: string) =>
  !!DEFAULT_RESIZE_CORNER_CURSORS.find((_c) => _c === c);
