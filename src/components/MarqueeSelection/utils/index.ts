// types
import type { Selection } from "@/types/selection.type";

// constants
import {
  DEFAULT_RESIZE_CORNER_CURSORS,
  FLIPPED_RESIZE_CORNER_CURSORS,
} from "../constants";

/**
 * Depending on how the user draws the selection (either from left to right or right to left),
 * the `startX` could be greater than `endX`. This occurs when the user begins drawing the selection
 * from the right side of the image and moves towards the left. Similarly, the same logic applies
 * for the Y-axis, where `startY` might be greater than `endY` if the user starts from the bottom
 * and moves upwards.
 *
 * these utils are handling situations due to the below description.
 * */

export function getCornerCursors(selection: Selection) {
  const fromTopLeft =
    selection.startX < selection.endX && selection.startY < selection.endY;
  const fromBottonRight =
    selection.startX > selection.endX && selection.startY > selection.endY;

  const isNormal = fromTopLeft || fromBottonRight;
  return isNormal
    ? DEFAULT_RESIZE_CORNER_CURSORS
    : FLIPPED_RESIZE_CORNER_CURSORS;
}

export function getBoundary(
  start: number,
  end: number,
  direction: keyof Pick<Math, "min" | "max">,
) {
  return Math[direction](start, end);
}
