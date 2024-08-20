import { type MouseEvent } from "react";

import styled from "@emotion/styled";

// utils
import { getSelectedAreaDimension } from "@/utils/selection.utils";
import { getBoundary } from "./utils";

// types
import { Selection } from "@/types/selection.type";
import { DeleteOutlined } from "@ant-design/icons";

// constants
import { DEFAULT_SELECTION_COLOR, OVERLAPPED_WARNING_COLOR } from "./constants";

const ICON_MARGIN = 8;
const ICON_SIZE = 16;
const SPACE_FOR_ICON = ICON_MARGIN + ICON_SIZE + 8;

function SelectionArea(props: {
  selection: Selection;
  isOverlapping: boolean;
  onMouseOver?: (e: MouseEvent) => void;
  onMouseOut?: (e: MouseEvent) => void;
  onDelete?: () => void;
  /** @description disable all event handlers */
  disabled?: boolean;
  iconHidden?: boolean;
  index?: number;
}) {
  const top = getBoundary(props.selection.startY, props.selection.endY, "min");
  const left = getBoundary(props.selection.startX, props.selection.endX, "min");
  const width = getSelectedAreaDimension(
    props.selection.startX,
    props.selection.endX,
  );
  const height = getSelectedAreaDimension(
    props.selection.startY,
    props.selection.endY,
  );

  const shouldPutIndexOutside =
    width <= SPACE_FOR_ICON || height <= SPACE_FOR_ICON;

  return (
    <>
      <div
        {...(!props.disabled
          ? {
              onMouseOver: props.onMouseOver,
              onMouseOut: props.onMouseOut,
            }
          : {})}
        style={{
          position: "absolute",
          border: `1px solid ${
            props.isOverlapping
              ? OVERLAPPED_WARNING_COLOR
              : DEFAULT_SELECTION_COLOR
          }`,
          top,
          left,
          width,
          height,
          boxSizing: "border-box", // TODO: use global style
        }}
      />
      {!props.iconHidden && (
        <>
          {" "}
          <IndexCircle
            style={{
              top: shouldPutIndexOutside ? top : top + ICON_MARGIN,
              left: shouldPutIndexOutside
                ? left - ICON_MARGIN - ICON_SIZE
                : left + ICON_MARGIN,
            }}
          >
            <span>{props.index}</span>
          </IndexCircle>
          <StyledDeleteOutlined
            {...(!props.disabled
              ? {
                  onClick: props.onDelete,
                }
              : {})}
            style={{
              top,
              left: left + width + ICON_MARGIN,
            }}
          />
        </>
      )}
    </>
  );
}

const StyledDeleteOutlined = styled(DeleteOutlined)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  // TODO: use theme
  color: #c5c5c7;
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
  padding: 4px;
  border: 1px solid #c5c5c7;
  border-radius: 2px;
  background-color: white;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
`;

const IndexCircle = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
  padding: 2px;
  font-size: 12px;
  border-radius: 50px;

  // TODO: use theme
  background-color: #c5c5c760;
`;

export default SelectionArea;
