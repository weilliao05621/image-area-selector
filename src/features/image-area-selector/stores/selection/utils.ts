// utils
import { getSelectedAreaDimension } from "@/features/image-area-selector/utils/selection.util";

// types
import { Selection } from "@/features/image-area-selector/types/selection.type";

const covertSizeToOrigin = (num: number, ratio: number) =>
  Math.round(num / ratio);

const getSelectedAreaCenter = (start: number, end: number) => (start + end) / 2;

export function generateSelectedAreaData(
  selection: Omit<Selection, "id">,
  ratio: number,
) {
  const { startX, endX, startY, endY } = selection;
  return {
    x: covertSizeToOrigin(getSelectedAreaCenter(startX, endX), ratio),
    y: covertSizeToOrigin(getSelectedAreaCenter(startY, endY), ratio),
    width: covertSizeToOrigin(getSelectedAreaDimension(startX, endX), ratio),
    height: covertSizeToOrigin(getSelectedAreaDimension(startY, endY), ratio),
  };
}
