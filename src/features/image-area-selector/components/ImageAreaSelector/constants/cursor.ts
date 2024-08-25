// types
import { SelectionId } from "@/features/image-area-selector/types/selection.type";

export const ACTIVE_CURSOR_DATA_ATTR = "data-active-cursor";
export const ACTIVE_SELECTION_ID_ATTR = "data-selection-id";

export const PANEL_ACTIVE_CURSOR_ATTRIBUTE = {
  [ACTIVE_CURSOR_DATA_ATTR]: "crosshair",
};
export const DRAG_ACTIVE_CURSOR_ATTRIBUTE = {
  [ACTIVE_CURSOR_DATA_ATTR]: "grabbing",
};
export const getResizerActiveCursorAttribute = (
  cursor: string,
  id: SelectionId,
) => ({
  [ACTIVE_CURSOR_DATA_ATTR]: cursor,
  [ACTIVE_SELECTION_ID_ATTR]: id,
});
