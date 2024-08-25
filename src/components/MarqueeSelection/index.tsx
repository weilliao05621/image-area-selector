import { useRef, type MouseEvent } from "react";

import styled from "@emotion/styled";
import { css, Global } from "@emotion/react";

// stores
import useSelectionStore from "@/stores/selection/index.store";

// hooks
import useEventCallback from "@/hooks/useEventCallback";
import { useCreateSelection, useUpdateSelection } from "./hooks";
import { useCursor } from "./hooks/cursor";

// types
import { type SelectionId } from "@/types/selection.type";
import { DIRECTION } from "./types";

// constants
import { MemoSelectionArea, SelectionArea } from "./SelectionArea";
import {
  MAX_IMAGE_CONTAINER_WIDTH,
  MAX_IMAGE_UPLOAD_PANEL_CONTENT_WIDTH,
} from "@/constants/layout.constant";
import { PANEL_ACTIVE_CURSOR_ATTRIBUTE } from "./constants";

interface ImageAreaSelectorProps {
  containerHeight: number;
  constrainX: (x: number) => [number, boolean];
  constrainY: (y: number) => [number, boolean];
}

const ImageAreaSelector = (props: ImageAreaSelectorProps) => {
  // STORES
  const selections = useSelectionStore((state) => state.selections);
  const setSelection = useSelectionStore((state) => state.setSelection);
  const updateSelection = useSelectionStore((state) => state.updateSelection);

  // ELEMENT REFS
  const selectionContainerRef = useRef<HTMLDivElement>(null);

  // HOOKS
  const getSelectionContainerElm = useRef<() => HTMLDivElement | null>(
    () => selectionContainerRef.current,
  ).current;
  const {
    currentSelection,
    creatingStatus,
    onStartCreatingSelection,
    onCreatingSelection,
    onEndCreatingSelection,
  } = useCreateSelection<HTMLDivElement>(
    selections,
    getSelectionContainerElm,
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
    getSelectionContainerElm,

    {
      x: props.constrainX,
      y: props.constrainY,
    },
    updateSelection,
  );

  const {
    activeCursor,
    onTriggerActiveCursor,
    onUpdateResizeCornerCursor,
    resetActiveCursor,
  } = useCursor(updatingStatus.activeSelectionId);

  const onStartUpdatingByResize = useEventCallback<
    [MouseEvent, SelectionId, DIRECTION],
    void
  >((e, id, direction) => {
    onStartUpdatingSelection(e, {
      id,
      direction,
    });
  });

  const onStartUpdatingByDrag = useEventCallback<
    [MouseEvent, SelectionId],
    void
  >((e, id) => {
    onStartUpdatingSelection(e, {
      id,
      direction: DIRECTION.NONE,
    });
  });

  return (
    <>
      {activeCursor && (
        <Global
          styles={css`
            * {
              cursor: ${activeCursor} !important;
            }
          `}
        />
      )}
      <AllSelectionContainer
        {...PANEL_ACTIVE_CURSOR_ATTRIBUTE}
        $height={props.containerHeight}
        ref={selectionContainerRef}
        onMouseDown={(e) => {
          onTriggerActiveCursor(e);
          onStartCreatingSelection(e);
        }}
        onMouseMove={(e) => {
          onUpdateResizeCornerCursor(e);
          // reduce event listeners (all have early return. will auto detect which one to use)
          onCreatingSelection(e);
          onUpdatingSelectionByResize(e);
          onUpdatingSelectionByDrag(e);
        }}
        onMouseUp={() => {
          resetActiveCursor();
          // reduce event listeners (all have early return. will auto detect which one to use)
          onEndCreatingSelection();
          onEndUpdatingSelection();
        }}
      >
        {selections.map((selection) => (
          <MemoSelectionArea
            key={selection.id}
            id={selection.id}
            startX={selection.startX}
            startY={selection.startY}
            endX={selection.endX}
            endY={selection.endY}
            isOverlappingOnOthers={
              updatingStatus.isUpdatingSelectionOverlapping &&
              updatingStatus.activeSelectionId === selection.id
            }
            onStartUpdatingByResize={onStartUpdatingByResize}
            onStartUpdatingByDrag={onStartUpdatingByDrag}
          />
        ))}
        {currentSelection && (
          <SelectionArea
            showOnlySelection
            startX={currentSelection.startX}
            startY={currentSelection.startY}
            endX={currentSelection.endX}
            endY={currentSelection.endY}
            isOverlappingOnOthers={
              creatingStatus.isCreatingSelectionOverlapping
            }
          />
        )}
      </AllSelectionContainer>
    </>
  );
};

export default ImageAreaSelector;

const containerLeft =
  (MAX_IMAGE_UPLOAD_PANEL_CONTENT_WIDTH - MAX_IMAGE_CONTAINER_WIDTH) / 2;

const AllSelectionContainer = styled.div<{ $height: number }>`
  &:hover {
    cursor: crosshair;
  }
  top: 0;
  left: ${containerLeft}px;
  width: ${MAX_IMAGE_CONTAINER_WIDTH}px;
  height: ${(props) => props.$height}px;
  position: absolute;
`;
