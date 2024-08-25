import { type ReactNode } from "react";

import styled from "@emotion/styled";

// stores
import useSelectionStore from "@/features/image-area-selector/stores/selection/index.store";

// components
import ImageSelections from "@/features/image-area-selector/components/ImageSelections";

// constants
import {
  MAX_IMAGE_CONTAINER_WIDTH,
  MAX_IMAGE_UPLOAD_PANEL_CONTENT_HEIGHT,
} from "@/features/image-area-selector/constants/layout.constant";

interface ImageAreaSelectorProps {
  children: ReactNode;
  imageHeight: number;
}

function ImageAreaSelector(props: ImageAreaSelectorProps) {
  const uploadedImageNode = props.children;

  const imageAspectRadio = useSelectionStore((state) => state.imageAspectRadio);

  // TODO: selections will be here
  return (
    <ScrollableWrapper>
      <ImageSelections
        containerHeight={props.imageHeight * imageAspectRadio}
        constrainX={(x) => [
          Math.min(Math.max(x, 0), MAX_IMAGE_CONTAINER_WIDTH),
          x > 0 && x < MAX_IMAGE_CONTAINER_WIDTH,
        ]}
        constrainY={(y) => [
          Math.min(Math.max(y, 0), props.imageHeight * imageAspectRadio),
          y > 0 && y < props.imageHeight * imageAspectRadio,
        ]}
      />
      {uploadedImageNode}
    </ScrollableWrapper>
  );
}

export default ImageAreaSelector;

const ScrollableWrapper = styled.div`
  position: relative;
  user-select: none;
  width: 100%;
  max-height: ${MAX_IMAGE_UPLOAD_PANEL_CONTENT_HEIGHT}px;
  overflow-y: scroll;
  border-radius: ${(props) => props.theme.borderRadius.sm};
`;
