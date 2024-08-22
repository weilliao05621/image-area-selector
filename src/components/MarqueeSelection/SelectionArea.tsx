import { useState, memo, type MouseEvent } from "react";

import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { DeleteOutlined } from "@ant-design/icons";

// types
import type { Selection, SelectionId } from "@/types/selection.type";

// constants
import { DEFAULT_SELECTION_COLOR, OVERLAPPED_WARNING_COLOR } from "./constants";
import useSelectionStore from "@/stores/selection/index.store";

const ICON_MARGIN = 8;
const EXTRA_SPACE_FOR_ICON = 8;

export function SelectionArea(props: {
  id?: Selection["id"];
  top: number;
  left: number;
  width: number;
  height: number;
  isOverlappingOnOthers: boolean;
}) {
  return (
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

export const MemoSelectionArea = memo(SelectionArea);
export const MemoDeleteSelectionIcon = memo(DeleteSelectionIcon);
export const MemoIndexDisplayer = memo(IndexDisplayer);
