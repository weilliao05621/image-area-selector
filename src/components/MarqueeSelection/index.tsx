import { useState, useRef, Fragment, type MouseEvent } from "react";

import styled from "@emotion/styled";

// store
import useSelectionStore from "@/stores/selection/index.store";

// utils
import { getCornerCursors, getBoundary } from "./utils";

// types
import { type Selection, type SelectionId } from "@/types/selection.type";
import { DIRECTION } from "./types";

// constants
import {
  DEFAULT_RESIZE_CURSORS,
  DEFAULT_SELECTION_COLOR,
  OVERLAPPED_WARNING_COLOR,
} from "./constants";
import SelectionArea from "./SelectionArea";

const START_ID_ORDER = 1 as SelectionId;
const CORNER_SQUARE_SIZE = 6;

interface MarqueeSelectionProps {
  containerHeight: number;
  constrainX: (x: number) => number;
  constrainY: (y: number) => number;
}

// FIX: improve cursor styling

/**
 * @description this component is heavily depended on currentSelection & selections,
 *              which are both states that are updated at every interaction.
 *              Since it doesn't rely on other components, no need to use optimization hooks for preventing re-rendering.
 * */
const MarqueeSelection = (props: MarqueeSelectionProps) => {
  // HOOKS
  const { selections, setSelection, updateSelection, deleteSelection } =
    useSelectionStore();
  const [currentSelection, setCurrentSelection] = useState<Selection | null>(
    null,
  );

  const selectionContainerRef = useRef<HTMLDivElement>(null);
  const selectionContainerBoundingClientRect = useRef<{
    left: number;
    top: number;
  } | null>(null);

  // for handler
  /** @description make mouseover early return if not ready for recording selection coordinate */
  const shouldMousemoveActivate = useRef<boolean>(false);
  /** @description prevent creating new selection if hovering existed one */
  const isHoveringExistedSelection = useRef<boolean>(false);

  /** @description record id for selections */
  const currentId = useRef<SelectionId>(START_ID_ORDER);

  // for interaction
  const isOverlapping = useRef<boolean>(false);
  const activeSelectionId = useRef<SelectionId | null>(null);
  const resizeDirection = useRef<DIRECTION | null>(null);
  /** @description fallback to original selection state after user still make the editing selection overlapping*/
  const preEditSelection = useRef<Selection | null>(null);
  /** @description for checking overlap after the selection edited */
  const postEditSelection = useRef<Selection | null>(null);

  // HANDLERS
  const handleMouseDown = (
    e: MouseEvent<HTMLDivElement>,
    id?: SelectionId,
    direction?: DIRECTION,
  ) => {
    if (e.target !== e.currentTarget) return;
    shouldMousemoveActivate.current = true;

    const rect = selectionContainerRef.current?.getBoundingClientRect();
    const left = rect?.left ?? 0;
    const top = rect?.top ?? 0;
    selectionContainerBoundingClientRect.current = { left, top };
    const startX = e.clientX - left;
    const startY = e.clientY - top;

    // only existed selection has id & adjusting direction
    if (direction && id) {
      resizeDirection.current = direction;
      activeSelectionId.current = id;
      return;
    }

    // avoid drawing on existed selection
    if (isOverlappingExistingSelection(startX, startY)) return;

    // avoid creating new selection when user is trying to editing exist one
    if (isHoveringExistedSelection.current) return;
    setCurrentSelection({
      startX,
      startY,
      endX: startX,
      endY: startY,
      id: currentId.current,
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!shouldMousemoveActivate.current) return;
    if (!selectionContainerRef.current) return;

    const { left, top } = selectionContainerBoundingClientRect.current!;

    // mousedown has constrain drawing on image outside or exist selections
    // so mousemove should constrain  drawing on image outside as well
    const endX = props.constrainX(e.clientX - left);
    const endY = props.constrainY(e.clientY - top);

    let selectionForOverlappingFeedback = null;

    if (currentSelection) {
      const updateSelection = {
        ...currentSelection, // get start coordinate
        endX,
        endY,
      };
      selectionForOverlappingFeedback = updateSelection;
      setCurrentSelection(updateSelection);
    } else {
      if (!activeSelectionId.current || !resizeDirection.current) return;
      const updatedSelections = selections.map((item) => ({ ...item }));
      const updatedSelection = updatedSelections.find(
        (s) => s.id === activeSelectionId.current,
      );
      if (!updatedSelection) return;

      if (preEditSelection.current?.id !== updatedSelection.id) {
        // prevent being edited
        preEditSelection.current = { ...updatedSelection };
      }

      if (resizeDirection.current.includes(DIRECTION.RIGHT)) {
        updatedSelection.endX = endX;
      }
      if (resizeDirection.current.includes(DIRECTION.LEFT)) {
        updatedSelection.startX = endX;
      }
      if (resizeDirection.current.includes(DIRECTION.BOTTOM)) {
        updatedSelection.endY = endY;
      }
      if (resizeDirection.current.includes(DIRECTION.TOP)) {
        updatedSelection.startY = endY;
      }

      selectionForOverlappingFeedback = updatedSelection;
      postEditSelection.current = updatedSelection;
      updateSelection(postEditSelection.current);
    }

    isOverlapping.current = !!(
      selectionForOverlappingFeedback &&
      isSelectionOverlapping(selectionForOverlappingFeedback)
    );
  };

  const handleMouseUp = () => {
    if (
      preEditSelection.current &&
      postEditSelection.current &&
      isSelectionOverlapping(postEditSelection.current)
    ) {
      updateSelection(preEditSelection.current);
    }

    if (currentSelection && !isSelectionOverlapping(currentSelection)) {
      setSelection(currentSelection);
    }

    setCurrentSelection(null);
    shouldMousemoveActivate.current = false;
    isOverlapping.current = false;
    activeSelectionId.current = null;
    resizeDirection.current = null;
    currentId.current++;
  };

  // UTILS
  const isOverlappingExistingSelection = (x: number, y: number): boolean => {
    return selections.some((selection) => {
      const { startX, startY, endX, endY } = selection;
      return x >= startX && x <= endX && y >= startY && y <= endY;
    });
  };

  const isSelectionOverlapping = (newSelection: Selection): boolean => {
    const { startX, startY, endX, endY, id } = newSelection;
    const newSelStartX = getBoundary(startX, endX, "min");
    const newSelEndX = getBoundary(startX, endX, "max");
    const newSelStartY = getBoundary(startY, endY, "min");
    const newSelEndY = getBoundary(startY, endY, "max");

    return selections.some((selection) => {
      if (selection.id === id) return false;
      const selStartX = getBoundary(selection.startX, selection.endX, "min");
      const selEndX = getBoundary(selection.startX, selection.endX, "max");
      const selStartY = getBoundary(selection.startY, selection.endY, "min");
      const selEndY = getBoundary(selection.startY, selection.endY, "max");

      return (
        newSelStartX < selEndX &&
        newSelEndX > selStartX &&
        newSelStartY < selEndY &&
        newSelEndY > selStartY
      );
    });
  };

  // RENDER
  const renderResizeHandles = (selection: Selection, id: SelectionId) => {
    const cornerCursors = getCornerCursors(selection);
    const positions = [
      {
        cursor: cornerCursors[0],
        top: selection.startY - CORNER_SQUARE_SIZE / 2,
        left: selection.startX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.TOP_LEFT,
      },
      {
        cursor: cornerCursors[1],
        top: selection.startY - CORNER_SQUARE_SIZE / 2,
        left: selection.endX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.TOP_RIGHT,
      },
      {
        cursor: cornerCursors[1],
        top: selection.endY - CORNER_SQUARE_SIZE / 2,
        left: selection.startX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.BOTTOM_LEFT,
      },
      {
        cursor: cornerCursors[0],
        top: selection.endY - CORNER_SQUARE_SIZE / 2,
        left: selection.endX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.BOTTOM_RIGHT,
      },
      {
        cursor: DEFAULT_RESIZE_CURSORS[0],
        top: selection.startY - CORNER_SQUARE_SIZE / 2,
        left: (selection.startX + selection.endX) / 2 - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.TOP,
      },
      {
        cursor: DEFAULT_RESIZE_CURSORS[1],
        top: (selection.startY + selection.endY) / 2 - CORNER_SQUARE_SIZE / 2,
        left: selection.endX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.RIGHT,
      },
      {
        cursor: DEFAULT_RESIZE_CURSORS[0],
        top: selection.endY - CORNER_SQUARE_SIZE / 2,
        left: (selection.startX + selection.endX) / 2 - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.BOTTOM,
      },
      {
        cursor: DEFAULT_RESIZE_CURSORS[1],
        top: (selection.startY + selection.endY) / 2 - CORNER_SQUARE_SIZE / 2,
        left: selection.startX - CORNER_SQUARE_SIZE / 2,
        direction: DIRECTION.LEFT,
      },
    ];

    const bgColor =
      activeSelectionId.current === id && isOverlapping.current
        ? OVERLAPPED_WARNING_COLOR
        : DEFAULT_SELECTION_COLOR;

    return positions.map((pos, index) => (
      <div
        key={`${id}-${index}`}
        onMouseDown={(e) => handleMouseDown(e, id, pos.direction)}
        style={{
          position: "absolute",
          width: CORNER_SQUARE_SIZE,
          height: CORNER_SQUARE_SIZE,
          backgroundColor: bgColor,
          cursor:
            isHoveringExistedSelection.current && activeSelectionId
              ? "crosshair"
              : pos.cursor,
          top: pos.top,
          left: pos.left,
        }}
      />
    ));
  };

  return (
    <SelectionContainer
      $height={props.containerHeight}
      ref={selectionContainerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        cursor: "crosshair",
      }}
    >
      {selections.map((selection, index) => (
        <Fragment key={selection.id}>
          <SelectionArea
            onMouseOver={() => {
              isHoveringExistedSelection.current = true;
              requestAnimationFrame(() => {
                selectionContainerRef.current!.style.cursor =
                  isOverlapping.current ? "crosshair" : "grab";
              });
            }}
            onMouseOut={() => {
              isHoveringExistedSelection.current = false;
              selectionContainerRef.current!.style.cursor = "crosshair";
            }}
            index={index + 1}
            onDelete={() => {
              deleteSelection(selection.id);
            }}
            selection={selection}
            isOverlapping={
              isOverlapping.current &&
              activeSelectionId.current === selection.id
            }
          />
          {renderResizeHandles(selection, selection.id)}
        </Fragment>
      ))}
      {currentSelection && (
        <SelectionArea
          selection={currentSelection}
          isOverlapping={isOverlapping.current}
          disabled
          iconHidden
        />
      )}
    </SelectionContainer>
  );
};

const SelectionContainer = styled.div<{ $height: number }>`
  top: 0;
  width: 100%;
  height: ${(props) => props.$height}px;
  position: absolute;
`;

export default MarqueeSelection;
