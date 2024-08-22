import { useState, memo, type MouseEvent } from "react";

import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { DeleteOutlined } from "@ant-design/icons";

// stores
import useSelectionStore from "@/stores/selection/index.store";

// types
import type { Selection, SelectionId } from "@/types/selection.type";
import { DIRECTION } from "./types";

// constants
import { DEFAULT_SELECTION_COLOR, OVERLAPPED_WARNING_COLOR } from "./constants";

const ICON_MARGIN = 8;
const EXTRA_SPACE_FOR_ICON = 8;
const CORNER_SQUARE_SIZE = 6;
const EXTRA_RESIZE_INTERACTION_SPACE = CORNER_SQUARE_SIZE * 1.5;

export function SelectionArea(props: {
  id?: Selection["id"];
  top: number;
  left: number;
  width: number;
  height: number;
  isOverlappingOnOthers: boolean;
  getResizeElementCursor?: (
    selection: Selection,
  ) => (direction: DIRECTION) => string;
  onMouseDown?: (
    e: MouseEvent,
    id: SelectionId,
    cursor: string,
    direction: DIRECTION,
  ) => void;
}) {
  const getSelection = useSelectionStore((state) => state.getSelection);

  const renderResizeHandles = (id: SelectionId) => {
    // make sure all handlers are binding to certain direction
    const selection = getSelection(id);
    const positions = [
      {
        top: selection.startY - CORNER_SQUARE_SIZE / 2,
        left: selection.startX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.TOP_LEFT,
        width: EXTRA_RESIZE_INTERACTION_SPACE,
        height: EXTRA_RESIZE_INTERACTION_SPACE,
      },
      {
        top: selection.startY - CORNER_SQUARE_SIZE / 2,
        left: selection.endX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.TOP_RIGHT,
        width: EXTRA_RESIZE_INTERACTION_SPACE,
        height: EXTRA_RESIZE_INTERACTION_SPACE,
      },
      {
        top: selection.endY - CORNER_SQUARE_SIZE / 2,
        left: selection.startX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.BOTTOM_LEFT,
        isAlign: true,
        width: EXTRA_RESIZE_INTERACTION_SPACE,
        height: EXTRA_RESIZE_INTERACTION_SPACE,
      },
      {
        top: selection.endY - CORNER_SQUARE_SIZE / 2,
        left: selection.endX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.BOTTOM_RIGHT,
        isAlign: true,
        width: EXTRA_RESIZE_INTERACTION_SPACE,
        height: EXTRA_RESIZE_INTERACTION_SPACE,
      },
      {
        top: selection.startY - CORNER_SQUARE_SIZE / 2,
        left: (selection.startX + selection.endX) / 2 - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.TOP,
        isAlign: false,
        width:
          Math.abs(selection.startX - selection.endX) -
          EXTRA_RESIZE_INTERACTION_SPACE * 2,
        height: EXTRA_RESIZE_INTERACTION_SPACE,
      },
      {
        top: (selection.startY + selection.endY) / 2 - CORNER_SQUARE_SIZE / 2,
        left: selection.endX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.RIGHT,
        isAlign: false,
        width: EXTRA_RESIZE_INTERACTION_SPACE,
        height:
          Math.abs(selection.startY - selection.endY) -
          EXTRA_RESIZE_INTERACTION_SPACE * 2,
      },
      {
        top: selection.endY - CORNER_SQUARE_SIZE / 2,
        left: (selection.startX + selection.endX) / 2 - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.BOTTOM,
        isAlign: false,
        width:
          Math.abs(selection.startX - selection.endX) -
          EXTRA_RESIZE_INTERACTION_SPACE * 2,
        height: EXTRA_RESIZE_INTERACTION_SPACE,
      },
      {
        top: (selection.startY + selection.endY) / 2 - CORNER_SQUARE_SIZE / 2,
        left: selection.startX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.LEFT,
        isAlign: false,
        width: EXTRA_RESIZE_INTERACTION_SPACE,
        height:
          Math.abs(selection.startY - selection.endY) -
          EXTRA_RESIZE_INTERACTION_SPACE * 2,
      },
    ];

    const bgColor = props.isOverlappingOnOthers
      ? OVERLAPPED_WARNING_COLOR
      : DEFAULT_SELECTION_COLOR;

    const getCursorByDirection = props.getResizeElementCursor
      ? props.getResizeElementCursor(selection)
      : null;

    return positions.map((pos, index) => {
      const cursor = getCursorByDirection
        ? getCursorByDirection(pos.direction)
        : "grabbing";
      return (
        <ResizeSquare
          key={`${id}-${index}`}
          onMouseDown={(e) => {
            if (!props.onMouseDown) return;
            props.onMouseDown(e, id, cursor, pos.direction);
          }}
          style={{
            position: "absolute",
            width: CORNER_SQUARE_SIZE,
            height: CORNER_SQUARE_SIZE,
            backgroundColor: bgColor,
            top: pos.top,
            left: pos.left,
          }}
          // for pesudo element to expand interaction range
          $direction={pos.direction}
          $height={pos.height}
          $width={pos.width}
          $cursor={cursor}
        />
      );
    });
  };
  return (
    <>
      <div
        style={{
          position: "absolute",
          border: `1px solid ${
            props.isOverlappingOnOthers
              ? OVERLAPPED_WARNING_COLOR
              : DEFAULT_SELECTION_COLOR
          }`,
          top: props.top,
          left: props.left,
          width: props.width,
          height: props.height,
        }}
      />
      {props.id && renderResizeHandles(props.id)}
    </>
  );
}

const DeleteSelectionIcon = (props: {
  top: number;
  left: number;
  width: number;
  id: SelectionId;
  disabled?: boolean;
}) => {
  const deleteSelection = useSelectionStore((state) => state.deleteSelection);

  return (
    <StyledDeleteOutlined
      style={{
        top: props.top,
        left: props.left + props.width + ICON_MARGIN,
      }}
      onClick={() => {
        if (props.disabled) return;
        if (!props.id) return;
        deleteSelection(props.id);
      }}
    />
  );
};

const IndexDisplayer = (props: {
  top: number;
  left: number;
  width: number;
  height: number;
  index: number;
}) => {
  const theme = useTheme();
  const iconSize = parseInt(theme.icon.size.sm);

  const validIndexSpace = ICON_MARGIN + EXTRA_SPACE_FOR_ICON + iconSize;
  const shouldPutIndexOutside =
    props.width <= validIndexSpace || props.height <= validIndexSpace;

  return (
    <IndexCircle
      style={{
        top: shouldPutIndexOutside ? props.top : props.top + ICON_MARGIN,
        left: shouldPutIndexOutside
          ? props.left - ICON_MARGIN - iconSize
          : props.left + ICON_MARGIN,
      }}
    >
      <span>{props.index}</span>
    </IndexCircle>
  );
};

export const DragDetector = (props: {
  top: number;
  left: number;
  width: number;
  height: number;
  getDragElementCursor?: (isHover: boolean) => string;
  onMouseDown?: (e: MouseEvent<HTMLDivElement>) => void;
}) => {
  const [isHover, setIsHover] = useState<boolean>(false);

  return (
    <div
      style={{
        position: "absolute",
        top: props.top + EXTRA_SPACE_FOR_ICON,
        left: props.left + EXTRA_SPACE_FOR_ICON,
        width: props.width - EXTRA_SPACE_FOR_ICON * 2,
        height: props.height - EXTRA_SPACE_FOR_ICON * 2,
        cursor: props?.getDragElementCursor
          ? props?.getDragElementCursor(isHover)
          : "inherit",
      }}
      onMouseDown={(e) => {
        if (!props.onMouseDown) return;
        props.onMouseDown(e);
      }}
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
    />
  );
};

const StyledDeleteOutlined = styled(DeleteOutlined)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.icon.color.gray["1"]};
  width: ${(props) => props.theme.icon.size.lg};
  height: ${(props) => props.theme.icon.size.lg};
  border: 1px solid ${(props) => props.theme.icon.color.gray["1"]};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  background-color: ${(props) => props.theme.color.palette.white};
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
`;

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

const ResizeSquare = styled.div<{
  $width: number;
  $height: number;
  $direction: DIRECTION;
  $cursor: string;
}>`
  cursor: ${(props) => props.$cursor};
  &::after {
    content: "";
    display: block;
    cursor: inherit;
    width: ${(props) => props.$width}px;
    height: ${(props) => props.$height}px;
    margin: ${(props) => {
      const mx = (props.$width - EXTRA_RESIZE_INTERACTION_SPACE) / 2;
      const my = (props.$height - EXTRA_RESIZE_INTERACTION_SPACE) / 2;

      switch (props.$direction) {
        case DIRECTION.TOP: {
          return `0 0 0 -${mx}px`;
        }
        case DIRECTION.BOTTOM: {
          return `0 0 0 -${mx}px`;
        }
        case DIRECTION.LEFT: {
          return `-${my}px 0 0 0`;
        }
        case DIRECTION.RIGHT: {
          return `-${my}px 0 0 0`;
        }

        default:
          return 0;
      }
    }};
    background-color: transparent;
  }
`;

export const MemoSelectionArea = memo(SelectionArea);
export const MemoDeleteSelectionIcon = memo(DeleteSelectionIcon);
export const MemoIndexDisplayer = memo(IndexDisplayer);
