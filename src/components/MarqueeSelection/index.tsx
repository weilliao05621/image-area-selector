import { useRef, Fragment, type MouseEvent } from "react";

import styled from "@emotion/styled";

// stores
import useSelectionStore from "@/stores/selection/index.store";

// hooks
import { useCreateSelection, useUpdateSelection } from "./hooks";
import { useCursor } from "./hooks/cursor";
import useEventCallback from "@/hooks/useEventCallback";

// types
import { type SelectionId } from "@/types/selection.type";
import { DIRECTION } from "./types";

// constants
import {
  MemoSelectionArea,
  DragDetector,
  SelectionArea,
  MemoDeleteSelectionIcon,
  MemoIndexDisplayer,
} from "./SelectionArea";
import {
  MAX_IMAGE_CONTAINER_WIDTH,
  MAX_IMAGE_UPLOAD_PANEL_CONTENT_WIDTH,
} from "@/constants/layout.constant";
import { getBoundary } from "./utils";
import { getSelectedAreaDimension } from "@/utils/selection.utils";

interface MarqueeSelectionProps {
  containerHeight: number;
  constrainX: (x: number) => [number, boolean];
  constrainY: (y: number) => [number, boolean];
}

/**
 * @description this component is heavily depended on currentSelection & selections,
 *              which are both states that are updated at almost every interaction.
 *              use optimization hooks (e.g. useEventCallback) for preventing re-rendering unchanged selection.
 * */
const MarqueeSelection = (props: MarqueeSelectionProps) => {
  // STORES
  const selections = useSelectionStore((state) => state.selections);
  const setSelection = useSelectionStore((state) => state.setSelection);
  const updateSelection = useSelectionStore((state) => state.updateSelection);

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
    getResizeElementCursor: _getResizeElementCursor,
    resetActiveCursor,
  } = useCursor(() => updatingStatus.activeSelectionId);

  const getResizeElementCursor = useEventCallback(_getResizeElementCursor);
  const onUpdateByResizer = useEventCallback<
    [MouseEvent, SelectionId, string, DIRECTION],
    void
  >((e, id, cursor, direction) => {
    setResizeElementCursor(id, cursor);
    onStartUpdatingSelection(e, {
      id,
      direction,
    });
  });

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
      {selections.map((selection, index) => {
        const left = getBoundary(selection.startX, selection.endX, "min");
        const top = getBoundary(selection.startY, selection.endY, "min");
        const width = getSelectedAreaDimension(
          selection.startX,
          selection.endX,
        );
        const height = getSelectedAreaDimension(
          selection.startY,
          selection.endY,
        );
        return (
          <Fragment key={selection.id}>
            <MemoSelectionArea
              id={selection.id}
              top={top}
              left={left}
              width={width}
              height={height}
              isOverlappingOnOthers={
                updatingStatus.isUpdatingSelectionOverlapping &&
                updatingStatus.activeSelectionId === selection.id
              }
              getResizeElementCursor={getResizeElementCursor}
              onMouseDown={onUpdateByResizer}
            />
            {/* TODO: wrap into selection area */}
            <MemoDeleteSelectionIcon
              top={top}
              left={left}
              width={width}
              id={selection.id}
              disabled={
                updatingStatus.activeSelectionId
                  ? updatingStatus.activeSelectionId !== selection.id
                  : false
              }
            />
            {/* TODO: wrap into selection area */}
            <DragDetector
              top={top}
              left={left}
              width={width}
              height={height}
              getDragElementCursor={getDragElementCursor}
              onMouseDown={(e) => {
                setDragElementCursor();
                onStartUpdatingSelection(e, {
                  id: selection.id,
                  direction: DIRECTION.NONE,
                });
              }}
            />
            {/* TODO: wrap into selection area (by portal to prevent index re-rendering) */}
            <MemoIndexDisplayer
              top={top}
              left={left}
              width={width}
              height={height}
              index={index + 1}
            />
          </Fragment>
        );
      })}
      {currentSelection && (
        // TODO: refactor this login inside SelectionArea
        <SelectionArea
          left={getBoundary(
            currentSelection.startX,
            currentSelection.endX,
            "min",
          )}
          top={getBoundary(
            currentSelection.startY,
            currentSelection.endY,
            "min",
          )}
          width={getSelectedAreaDimension(
            currentSelection.startX,
            currentSelection.endX,
          )}
          height={getSelectedAreaDimension(
            currentSelection.startY,
            currentSelection.endY,
          )}
          isOverlappingOnOthers={creatingStatus.isCreatingSelectionOverlapping}
        />
      )}
    </SelectionContainer>
  );
};

const SelectionContainer = styled.div<{ $height: number }>`
  top: 0;
  left: ${(MAX_IMAGE_UPLOAD_PANEL_CONTENT_WIDTH - MAX_IMAGE_CONTAINER_WIDTH) /
  2}px;
  width: ${MAX_IMAGE_CONTAINER_WIDTH}px;
  height: ${(props) => props.$height}px;
  position: absolute;
`;

export default MarqueeSelection;
