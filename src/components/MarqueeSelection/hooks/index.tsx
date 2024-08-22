import { useRef, useState, type MouseEvent } from "react";

// types
import { Selection, SelectionId } from "@/types/selection.type";
import { DIRECTION } from "../types";
import { getBoundary } from "../utils";

type SetSelectionFn = (
  e: MouseEvent<Element>,
  updateOptions?: {
    id: SelectionId;
    direction: DIRECTION;
    cursor: string;
  },
) => void;

type ConstrainFn = (value: number) => [number, boolean];

type GetContainerElmFromRef<T> = () => T | null;

export const useCreateSelection = <ContainerElm extends HTMLElement>(
  selections: Array<Selection>,
  getContainerElm: GetContainerElmFromRef<ContainerElm>,
  constrainFn: { x: ConstrainFn; y: ConstrainFn },
  pushSelectionList: (selection: Selection) => void,
) => {
  const [currentSelection, setCurrentSelection] = useState<Selection | null>(
    null,
  );
  const isActivateSelecting = useRef<boolean>(false);
  const isOverlapping = useRef<boolean>(false);

  const containerBoundingClientRect = useRef<{
    left: number;
    top: number;
  } | null>(null);

  const onStartCreatingSelection: SetSelectionFn = (e, updateOptions) => {
    if (updateOptions) return;
    isActivateSelecting.current = true;
    if (e.target !== e.currentTarget) return;

    const startInfo = getStartPoint(
      { x: e.clientX, y: e.clientY },
      getContainerElm(),
    );
    if (!startInfo) return;
    const [startX, startY, rect] = startInfo;
    containerBoundingClientRect.current = { ...rect };

    setCurrentSelection({
      startX,
      startY,
      endX: startX,
      endY: startY,
      id: crypto.randomUUID() as SelectionId,
    });
  };

  const onCreatingSelection = (e: MouseEvent<HTMLElement>) => {
    if (!isActivateSelecting.current) return;
    if (!containerBoundingClientRect.current) return;
    if (!currentSelection) return;

    const { left, top } = containerBoundingClientRect.current;

    const [endX] = constrainFn.x(e.clientX - left);
    const [endY] = constrainFn.y(e.clientY - top);

    const updatedSelection = {
      ...currentSelection, // get start coordinates
      endX,
      endY,
    };

    isOverlapping.current = !!(
      updatedSelection && isSelectionOverlapping(updatedSelection, selections)
    );
    setCurrentSelection(updatedSelection);
  };

  const onEndCreatingSelection = () => {
    if (!currentSelection) return;

    // ensure to be on the panel
    if (!isSelectionOverlapping(currentSelection, selections)) {
      pushSelectionList(currentSelection);
    }

    setCurrentSelection(null);
  };

  return {
    currentSelection,
    creatingStatus: {
      isCreatingSelectionOverlapping: isOverlapping.current,
    },
    onStartCreatingSelection,
    onCreatingSelection,
    onEndCreatingSelection,
  };
};

export const useUpdateSelection = <ContainerElm extends HTMLElement>(
  selections: Array<Selection>,
  getContainerElm: GetContainerElmFromRef<ContainerElm>,
  constrainFn: { x: ConstrainFn; y: ConstrainFn },
  updateSelection: (selection: Selection) => void,
  // onCursorStale: (when:boolean) => [when: boolean, newCursor: string],
) => {
  const [activeCursor, setActiveCursor] = useState<string | null>(null);

  const containerBoundingClientRect = useRef<{
    left: number;
    top: number;
  } | null>(null);

  const isActivateSelecting = useRef<boolean>(false);
  const isOverlapping = useRef<boolean>(false);

  const activeSelectionId = useRef<SelectionId | null>(null);
  const resizeDirection = useRef<DIRECTION | null>(null);

  /** @description save for reverting original selection state after user still make the editing selection overlapping */
  const preEditSelection = useRef<Selection | null>(null);
  /** @description for checking overlap after the selection edited */
  const postEditSelection = useRef<Selection | null>(null);

  const dragStart = useRef<Omit<Selection, "id" | "endX" | "endY"> | null>(
    null,
  );

  const onStartUpdatingSelection: SetSelectionFn = (e, updateOptions) => {
    if (!updateOptions) return;

    isActivateSelecting.current = true;

    const startInfo = getStartPoint(
      { x: e.clientX, y: e.clientY },
      getContainerElm(),
    );
    if (!startInfo) return;
    const [startX, startY, rect] = startInfo;
    containerBoundingClientRect.current = { ...rect };
    dragStart.current = { startX, startY };

    const { id, direction, cursor } = updateOptions;

    resizeDirection.current = direction;
    activeSelectionId.current = id;
    setActiveCursor(cursor);
  };

  const onUpdatingSelectionByResize = (e: MouseEvent<HTMLElement>) => {
    if (!isActivateSelecting.current) return;
    if (!containerBoundingClientRect.current) return;
    if (!activeSelectionId.current) return;
    if (!resizeDirection.current) return;
    if (resizeDirection.current === DIRECTION.NONE) return;

    const { left, top } = containerBoundingClientRect.current;

    const [endX] = constrainFn.x(e.clientX - left);
    const [endY] = constrainFn.y(e.clientY - top);

    const _updatedSelection = selections.find(
      (s) => s.id === activeSelectionId.current,
    );
    if (!_updatedSelection) return;
    const updatedSelection = { ..._updatedSelection };

    if (!preEditSelection.current) {
      // spread to prevent being edited by the following mutation
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

    postEditSelection.current = updatedSelection;
    updateSelection(postEditSelection.current);
    isOverlapping.current = !!(
      updatedSelection && isSelectionOverlapping(updatedSelection, selections)
    );
  };

  const onUpdatingSelectionByDrag = (e: MouseEvent<HTMLElement>) => {
    if (!isActivateSelecting.current) return;
    if (!containerBoundingClientRect.current) return;
    if (!dragStart.current) return;
    if (resizeDirection.current !== DIRECTION.NONE) return;

    const { left, top } = containerBoundingClientRect.current;

    const [endX] = constrainFn.x(e.clientX - left);
    const [endY] = constrainFn.y(e.clientY - top);

    const _updatedSelection = selections.find(
      (s) => s.id === activeSelectionId.current,
    );
    if (!_updatedSelection) return;
    const updatedSelection = { ..._updatedSelection };

    if (!preEditSelection.current) {
      // spread to prevent being edited by the following mutation
      preEditSelection.current = { ...updatedSelection };
    }

    const movementX = endX - dragStart.current.startX;
    const movementY = endY - dragStart.current.startY;

    const [startXMovement, isStartXInLimit] = constrainFn.x(
      updatedSelection.startX + movementX,
    );
    const [endXMovement, isEndXInLimit] = constrainFn.x(
      updatedSelection.endX + movementX,
    );
    const [startYMovement, isStartYInLimit] = constrainFn.y(
      updatedSelection.startY + movementY,
    );
    const [endYMovement, isEndYInLimit] = constrainFn.y(
      updatedSelection.endY + movementY,
    );

    const isXInLimit = isStartXInLimit && isEndXInLimit;
    const isYInLimit = isStartYInLimit && isEndYInLimit;

    if (isXInLimit) {
      updatedSelection.startX = startXMovement;
      updatedSelection.endX = endXMovement;
    }

    if (isYInLimit) {
      updatedSelection.startY = startYMovement;
      updatedSelection.endY = endYMovement;
    }

    dragStart.current = {
      startX: endX,
      startY: endY,
    };

    postEditSelection.current = updatedSelection;
    updateSelection(postEditSelection.current);
    isOverlapping.current = !!(
      updatedSelection && isSelectionOverlapping(updatedSelection, selections)
    );
  };

  const onEndUpdatingSelection = () => {
    if (
      preEditSelection.current &&
      postEditSelection.current &&
      isSelectionOverlapping(postEditSelection.current, selections)
    ) {
      updateSelection(preEditSelection.current);
    }

    setActiveCursor(null);
    preEditSelection.current = null;
    postEditSelection.current = null;
    isActivateSelecting.current = false;
    isOverlapping.current = false;
    activeSelectionId.current = null;
    resizeDirection.current = null;
    dragStart.current = null;
  };

  return {
    status: {
      activeCursor,
      isUpdatingSelectionOverlapping: isOverlapping.current,
      activeSelectionId: activeSelectionId.current,
    },
    onStartUpdatingSelection,
    onUpdatingSelectionByResize,
    onUpdatingSelectionByDrag,
    onEndUpdatingSelection,
  };
};

// UTILS
type Coordinates = {
  x: number;
  y: number;
};

function getStartPoint(coordinates: Coordinates, containerElm: Element | null) {
  if (!containerElm) return;

  const rect = containerElm.getBoundingClientRect();
  const left = rect?.left ?? 0;
  const top = rect?.top ?? 0;
  const startX = coordinates.x - left;
  const startY = coordinates.y - top;
  return [startX, startY, { left, top }] as const;
}

function isSelectionOverlapping(
  newSelection: Selection,
  selections: Array<Selection>,
): boolean {
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
}
