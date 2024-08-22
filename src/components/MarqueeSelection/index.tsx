import { useRef, Fragment } from "react";

import styled from "@emotion/styled";

// stores
import useSelectionStore from "@/stores/selection/index.store";

// hooks
import { useCreateSelection, useUpdateSelection } from "./hooks";
import { useCursor } from "./hooks/cursor";

// types
import { type Selection, type SelectionId } from "@/types/selection.type";
import { DIRECTION } from "./types";

// constants
import { DEFAULT_SELECTION_COLOR, OVERLAPPED_WARNING_COLOR } from "./constants";
import SelectionArea from "./SelectionArea";
import { MAX_IMAGE_CONTAINER_WIDTH } from "@/constants/layout.constant";

const CORNER_SQUARE_SIZE = 6;
const EXTRA_RESIZE_INTERACTION_SPACE = CORNER_SQUARE_SIZE * 1.5;

interface MarqueeSelectionProps {
  containerHeight: number;
  constrainX: (x: number) => [number, boolean];
  constrainY: (y: number) => [number, boolean];
}

/**
 * @description this component is heavily depended on currentSelection & selections,
 *              which are both states that are updated at every interaction.
 *              Since it doesn't rely on other components, no need to use optimization hooks for preventing re-rendering.
 * */
const MarqueeSelection = (props: MarqueeSelectionProps) => {
  // STORES
  const selections = useSelectionStore((state) => state.selections);
  const setSelection = useSelectionStore((state) => state.setSelection);
  const updateSelection = useSelectionStore((state) => state.updateSelection);
  const deleteSelection = useSelectionStore((state) => state.deleteSelection);

  // ELEMENT REFS
  const selectionContainerRef = useRef<HTMLDivElement>(null);

  // HOOKS
  const getSelectionContainerElm = useRef<() => HTMLDivElement | null>(
    () => selectionContainerRef.current,
  );
  const {
    currentSelection,
    creatingStatus,
    onStartCreatingSelection,
    onCreatingSelection,
    onEndCreatingSelection,
  } = useCreateSelection<HTMLDivElement>(
    selections,
    getSelectionContainerElm.current,
    {
      x: props.constrainX,
      y: props.constrainY,
    },
    setSelection,
  );
  const {
    status: updatingStatus,
    onStartUpdatingSelection,
    onUpdatingSelectionByDrag,
    onUpdatingSelectionByResize,
    onEndUpdatingSelection,
  } = useUpdateSelection<HTMLDivElement>(
    selections,
    getSelectionContainerElm.current,

    {
      x: props.constrainX,
      y: props.constrainY,
    },
    updateSelection,
  );

  const {
    setDragElementCursor,
    setResizeElementCursor,
    getPanelCursor,
    getDragElementCursor,
    getResizeElementCursor,
    resetActiveCursor,
  } = useCursor(() => updatingStatus.activeSelectionId);

  // RENDER
  const renderResizeHandles = (selection: Selection, id: SelectionId) => {
    // make sure all handlers are binding to certain direction
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

    const bgColor =
      updatingStatus.activeSelectionId === id &&
      updatingStatus.isUpdatingSelectionOverlapping
        ? OVERLAPPED_WARNING_COLOR
        : DEFAULT_SELECTION_COLOR;
    const getCursorByDirection = getResizeElementCursor(selection);

    return positions.map((pos, index) => {
      const cursor = getCursorByDirection(pos.direction);
      return (
        <ResizeSquare
          key={`${id}-${index}`}
          onMouseDown={(e) => {
            setResizeElementCursor(id, cursor);
            onStartUpdatingSelection(e, {
              id,
              direction: pos.direction,
            });
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
    <SelectionContainer
      $height={props.containerHeight}
      ref={selectionContainerRef}
      onMouseDown={onStartCreatingSelection}
      onMouseMove={(e) => {
        // all have early return. will auto detect which one to use
        onCreatingSelection(e);
        onUpdatingSelectionByResize(e);
        onUpdatingSelectionByDrag(e);
      }}
      onMouseUp={() => {
        resetActiveCursor();
        // all have early return. will auto detect which one to use
        onEndCreatingSelection();
        onEndUpdatingSelection();
      }}
      style={{
        cursor: getPanelCursor(),
      }}
    >
      {selections.map((selection, index) => (
        <Fragment key={selection.id}>
          <SelectionArea
            selection={selection}
            onMouseDown={(e) => {
              setDragElementCursor();
              onStartUpdatingSelection(e, {
                id: selection.id,
                direction: DIRECTION.NONE,
              });
            }}
            onDelete={() => {
              deleteSelection(selection.id);
            }}
            disabled={
              updatingStatus.activeSelectionId
                ? updatingStatus.activeSelectionId !== selection.id
                : false
            }
            // display purpose
            index={index + 1}
            getGrabDetectorCursor={getDragElementCursor}
            isOverlappingOnOthers={
              updatingStatus.isUpdatingSelectionOverlapping &&
              updatingStatus.activeSelectionId === selection.id
            }
          />
          {renderResizeHandles(selection, selection.id)}
        </Fragment>
      ))}
      {currentSelection && (
        <SelectionArea
          selection={currentSelection}
          disabled
          // display purpose
          iconHidden
          isOverlappingOnOthers={creatingStatus.isCreatingSelectionOverlapping}
        />
      )}
    </SelectionContainer>
  );
};

const SelectionContainer = styled.div<{ $height: number }>`
  top: 0;
  width: ${MAX_IMAGE_CONTAINER_WIDTH}px;
  height: ${(props) => props.$height}px;
  position: absolute;
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

export default MarqueeSelection;
