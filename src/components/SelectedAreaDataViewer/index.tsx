import { memo } from "react";

import styled from "@emotion/styled";

// store
import useSelectionStore from "@/stores/selection/index.store";

// constants
import {
  MAX_VIEWER_HEIGHT,
  MAX_VIEWER_WIDTH,
} from "@/constants/layout.constant";

// types
import type { Selection } from "@/types/selection.type";

function SelectedAreaDataViewer() {
  const selections = useSelectionStore((state) => state.selections);

  return (
    <Wrapper>
      {selections.length > 0 &&
        selections.map((item) => (
          <MemoPreviewDataItem
            key={item.id}
            startX={item.startX}
            startY={item.startY}
            endX={item.endX}
            endY={item.endY}
          />
        ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: ${MAX_VIEWER_WIDTH}px;
  height: ${MAX_VIEWER_HEIGHT}px;
  overflow-y: auto;
  margin-left: 136px;
  padding: 24px 36px;
  border-radius: ${(props) => props.theme.borderRadius.sm};
  background-color: ${(props) => props.theme.color.panel.bg.code};
  color: white;
`;

const PreviewDataItem = (props: Omit<Selection, "id">) => {
  const getPreviewData = useSelectionStore((state) => state.getPreviewData);

  const object = getPreviewData({
    startX: props.startX,
    startY: props.startY,
    endX: props.endX,
    endY: props.endY,
  });

  return <pre>{JSON.stringify(object, null, 2)}</pre>;
};

const MemoPreviewDataItem = memo(PreviewDataItem);

export default SelectedAreaDataViewer;
