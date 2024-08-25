import { memo } from "react";

import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

// utils
import { getSelectedAreaDimension } from "@/features/image-area-selector/utils/selection.util";
import { getBoundary } from "../utils";

const ICON_MARGIN = 8;
const EXTRA_SPACE_FOR_ICON = 8;

// prevent the whole selection re-rendering when deleted
const IndexDisplayer = (props: {
  index: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}) => {
  const theme = useTheme();

  const iconSize = parseInt(theme.icon.size.sm);

  const left = getBoundary(props.startX, props.endX, "min");
  const top = getBoundary(props.startY, props.endY, "min");
  const width = getSelectedAreaDimension(props.startX, props.endX);
  const height = getSelectedAreaDimension(props.startY, props.endY);

  const validIndexSpace = ICON_MARGIN + EXTRA_SPACE_FOR_ICON + iconSize;
  const shouldPutIndexOutside =
    width <= validIndexSpace || height <= validIndexSpace;

  return (
    <IndexCircle
      style={{
        top: shouldPutIndexOutside ? top : top + ICON_MARGIN,
        left: shouldPutIndexOutside
          ? left - ICON_MARGIN - iconSize
          : left + ICON_MARGIN,
      }}
    >
      <span>{props.index}</span>
    </IndexCircle>
  );
};

const IndexCircle = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.color.palette.black};
  width: ${(props) => props.theme.icon.size.sm};
  height: ${(props) => props.theme.icon.size.sm};
  padding: 2px;
  font-size: 12px;
  border-radius: ${(props) => props.theme.borderRadius.full};
  background-color: ${(props) => props.theme.icon.color.gray["1"]}60;
`;

const MemoIndexDisplayer = memo(IndexDisplayer);

export default MemoIndexDisplayer;
