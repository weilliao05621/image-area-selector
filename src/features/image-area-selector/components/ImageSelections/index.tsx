import { useRef, type MouseEvent } from "react";

import styled from "@emotion/styled";

// stores
import useSelectionStore from "@/features/image-area-selector/stores/selection/index.store";

// components
import { MemoSelectionArea, SelectionArea } from "./components/SelectionArea";

// hooks
import useEventCallback from "@/hooks/useEventCallback";
import { useCreateSelection, useUpdateSelection } from "./hooks/position";

// constants
import { DIRECTION } from "./constants/position";
import {
  MAX_IMAGE_CONTAINER_WIDTH,
  MAX_IMAGE_UPLOAD_PANEL_CONTENT_WIDTH,
} from "@/features/image-area-selector/constants/layout.constant";

// types
import { SelectionId } from "@/features/image-area-selector/types/selection.type";

interface ImageSelectionsProps {
  containerHeight: number;
  constrainX: (x: number) => [number, boolean];
  constrainY: (y: number) => [number, boolean];
}

const ImageSelections = (props: ImageSelectionsProps) => {
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
    <AllSelectionContainer
      $height={props.containerHeight}
      ref={selectionContainerRef}
      onMouseDown={(e) => {
        onStartCreatingSelection(e);
      }}
      onMouseMove={(e) => {
        // reduce event listeners (all have early return. will auto detect which one to use)
        onCreatingSelection(e);
        onUpdatingSelectionByResize(e);
        onUpdatingSelectionByDrag(e);
      }}
      onMouseUp={() => {
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
          isOverlappingOnOthers={creatingStatus.isCreatingSelectionOverlapping}
        />
      )}
    </AllSelectionContainer>
  );
};

export default ImageSelections;

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
