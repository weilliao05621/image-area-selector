import { memo, useRef, type MouseEvent } from "react";

import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { DeleteOutlined } from "@ant-design/icons";

// stores
import useSelectionStore from "@/features/image-area-selector/stores/selection";

// utils
import { getSelectedAreaDimension } from "@/features/image-area-selector/utils/selection.util";
import { getBoundary } from "../utils";
import { getResizerCursors } from "../hooks/cursor";

// constants
import {
  DEFAULT_SELECTION_COLOR,
  DIRECTION,
  OVERLAPPED_WARNING_COLOR,
} from "../constants/position";
import {
  DRAG_ACTIVE_CURSOR_ATTRIBUTE,
  getResizerActiveCursorAttribute,
} from "../constants/cursor";

// types
import { SelectionId } from "@/features/image-area-selector/types/selection.type";

const ICON_MARGIN = 8;
const EXTRA_SPACE_FOR_ICON = 8;
const CORNER_SQUARE_SIZE = 6;
const EXTRA_RESIZE_INTERACTION_SPACE = CORNER_SQUARE_SIZE * 1.5;

export function SelectionArea(props: {
  id?: SelectionId;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isOverlappingOnOthers: boolean;
  showOnlySelection?: boolean;
  onStartUpdatingByResize?: (
    e: MouseEvent,
    id: SelectionId,
    direction: DIRECTION,
  ) => void;
  onStartUpdatingByDrag?: (e: MouseEvent, id: SelectionId) => void;
}) {
  const getSelection = useSelectionStore((state) => state.getSelection);

  const left = getBoundary(props.startX, props.endX, "min");
  const top = getBoundary(props.startY, props.endY, "min");
  const width = getSelectedAreaDimension(props.startX, props.endX);
  const height = getSelectedAreaDimension(props.startY, props.endY);

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
        width: EXTRA_RESIZE_INTERACTION_SPACE,
        height: EXTRA_RESIZE_INTERACTION_SPACE,
      },
      {
        top: selection.endY - CORNER_SQUARE_SIZE / 2,
        left: selection.endX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.BOTTOM_RIGHT,
        width: EXTRA_RESIZE_INTERACTION_SPACE,
        height: EXTRA_RESIZE_INTERACTION_SPACE,
      },
      {
        top: selection.startY - CORNER_SQUARE_SIZE / 2,
        left: (selection.startX + selection.endX) / 2 - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.TOP,
        width:
          Math.abs(selection.startX - selection.endX) -
          EXTRA_RESIZE_INTERACTION_SPACE * 2,
        height: EXTRA_RESIZE_INTERACTION_SPACE,
      },
      {
        top: (selection.startY + selection.endY) / 2 - CORNER_SQUARE_SIZE / 2,
        left: selection.endX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.RIGHT,
        width: EXTRA_RESIZE_INTERACTION_SPACE,
        height:
          Math.abs(selection.startY - selection.endY) -
          EXTRA_RESIZE_INTERACTION_SPACE * 2,
      },
      {
        top: selection.endY - CORNER_SQUARE_SIZE / 2,
        left: (selection.startX + selection.endX) / 2 - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.BOTTOM,
        width:
          Math.abs(selection.startX - selection.endX) -
          EXTRA_RESIZE_INTERACTION_SPACE * 2,
        height: EXTRA_RESIZE_INTERACTION_SPACE,
      },
      {
        top: (selection.startY + selection.endY) / 2 - CORNER_SQUARE_SIZE / 2,
        left: selection.startX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.LEFT,
        width: EXTRA_RESIZE_INTERACTION_SPACE,
        height:
          Math.abs(selection.startY - selection.endY) -
          EXTRA_RESIZE_INTERACTION_SPACE * 2,
      },
    ] as const;

    const bgColor = props.isOverlappingOnOthers
      ? OVERLAPPED_WARNING_COLOR
      : DEFAULT_SELECTION_COLOR;

    const cursors = getResizerCursors(selection);

    return positions.map((pos, index) => {
      const cursor = cursors[pos.direction];
      const resizerCursorData = getResizerActiveCursorAttribute(cursor, id);

      return (
        <ResizeSquare
          key={`${id}-${index}`}
          {...resizerCursorData}
          onMouseDown={(e) => {
            if (!props.onStartUpdatingByResize) return;
            props.onStartUpdatingByResize(e, id, pos.direction);
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
          top,
          left,
          width,
          height,
        }}
      />
      {!props.showOnlySelection && props.id && (
        <>
          <DeleteSelectionIcon
            top={top}
            left={left}
            width={width}
            id={props.id}
          />
          <IndexDisplayer
            top={top}
            left={left}
            width={width}
            height={height}
            id={props.id}
          />
          <DragDetector
            top={top}
            left={left}
            width={width}
            height={height}
            onMouseDown={(e) => {
              if (!props.onStartUpdatingByDrag) return;
              props.onStartUpdatingByDrag(e, props.id!);
            }}
          />
          {renderResizeHandles(props.id)}
        </>
      )}
    </>
  );
}

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

const DeleteSelectionIcon = (props: {
  id: SelectionId;
  top: number;
  left: number;
  width: number;
}) => {
  const deleteSelection = useSelectionStore((state) => state.deleteSelection);

  return (
    <StyledDeleteOutlined
      style={{
        top: props.top,
        left: props.left + props.width + ICON_MARGIN,
      }}
      onClick={() => {
        deleteSelection(props.id);
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

const IndexDisplayer = (props: {
  id: SelectionId;
  top: number;
  left: number;
  width: number;
  height: number;
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
      <Index id={props.id} />
    </IndexCircle>
  );
};

// prevent the whole selection re-rendering
const Index = (props: { id: SelectionId }) => {
  // stores
  const getSelectionIndex = useSelectionStore(
    (state) => state.getSelectionIndex,
  );
  const selectionLength = useSelectionStore((state) => state.selectionLength);

  // hooks
  const index = useRef<number>(1);

  // reduce index calculation
  if (selectionLength > -1) {
    index.current = getSelectionIndex(props.id);
  }

  return <span>{index.current}</span>;
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

const DragDetector = (props: {
  top: number;
  left: number;
  width: number;
  height: number;
  onMouseDown: (e: MouseEvent<HTMLDivElement>) => void;
}) => {
  return (
    <StyledDragDetector
      {...DRAG_ACTIVE_CURSOR_ATTRIBUTE}
      style={{
        position: "absolute",
        top: props.top + EXTRA_SPACE_FOR_ICON / 2,
        left: props.left + EXTRA_SPACE_FOR_ICON / 2,
        width: props.width - EXTRA_SPACE_FOR_ICON,
        height: props.height - EXTRA_SPACE_FOR_ICON,
      }}
      onMouseDown={props.onMouseDown}
    />
  );
};

const StyledDragDetector = styled.div`
  &:hover {
    cursor: grab;
  }
`;

export const MemoSelectionArea = memo(SelectionArea);
