import { useState } from "react";

// types
import { Selection, SelectionId } from "@/types/selection.type";
import { DIRECTION } from "../types";

const DEFAULT_RESIZE_CURSORS = ["row-resize", "col-resize"] as const;
const DEFAULT_RESIZE_CORNER_CURSORS = ["nwse-resize", "nesw-resize"] as const;
const FLIPPED_RESIZE_CORNER_CURSORS = ["nesw-resize", "nwse-resize"] as const;
const DEFAULT_CURSOR = "inherit";

export const useCursor = (getActiveSelectionId: () => SelectionId | null) => {
  const [activeCursor, setActiveCursor] = useState<string | null>(null);

  const setResizeElementCursor = (id: SelectionId, cursor: string) => {
    if (getActiveSelectionId() !== id) return;
    setActiveCursor(cursor);
  };

  const setDragElementCursor = () => {
    setActiveCursor("grabbing");
  };

  const resetActiveCursor = () => setActiveCursor(null);

  const getResizeElementCursor = (selection: Selection) => {
    const cursors = getCornerCursors(selection);
    return (direction: DIRECTION) => cursors[direction];
  };

  const getDragElementCursor = (isHover: boolean) =>
    activeCursor ? activeCursor : isHover ? "grab" : DEFAULT_CURSOR;

  const getPanelCursor = () => activeCursor ?? "crosshair";

  return {
    resetActiveCursor,
    setDragElementCursor,
    setResizeElementCursor,
    getResizeElementCursor,
    getDragElementCursor,
    getPanelCursor,
  };
};

// UTILS
export function getCornerCursors(selection: Selection) {
  const fromTopLeft =
    selection.startX < selection.endX && selection.startY < selection.endY;
  const fromBottonRight =
    selection.startX > selection.endX && selection.startY > selection.endY;

  const isNormal = fromTopLeft || fromBottonRight;

  const cursors = isNormal
    ? DEFAULT_RESIZE_CORNER_CURSORS
    : FLIPPED_RESIZE_CORNER_CURSORS;

  const cursorsByPosition: { [key in DIRECTION]: string } = {
    [DIRECTION.TOP_LEFT]: cursors[0],
    [DIRECTION.BOTTOM_RIGHT]: cursors[0],
    [DIRECTION.TOP_RIGHT]: cursors[1],
    [DIRECTION.BOTTOM_LEFT]: cursors[1],
    [DIRECTION.TOP]: DEFAULT_RESIZE_CURSORS[0],
    [DIRECTION.BOTTOM]: DEFAULT_RESIZE_CURSORS[0],
    [DIRECTION.LEFT]: DEFAULT_RESIZE_CURSORS[1],
    [DIRECTION.RIGHT]: DEFAULT_RESIZE_CURSORS[1],
    [DIRECTION.NONE]: "inherit",
  } as const;

  return cursorsByPosition;
}
