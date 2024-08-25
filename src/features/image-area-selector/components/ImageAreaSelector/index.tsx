import { type ReactNode } from "react";

import styled from "@emotion/styled";

// constants
import { MAX_IMAGE_UPLOAD_PANEL_CONTENT_HEIGHT } from "@/features/image-area-selector/constants/layout.constant";

interface ImageAreaSelectorProps {
  children: ReactNode;
}

function ImageAreaSelector(props: ImageAreaSelectorProps) {
  const previewImageNode = props.children;

  // TODO: selections will be here
  return <RelativeWrapper>{previewImageNode}</RelativeWrapper>;
}

export default ImageAreaSelector;

const RelativeWrapper = styled.div`
  position: relative;
  user-select: none;
  width: 100%;
  max-height: ${MAX_IMAGE_UPLOAD_PANEL_CONTENT_HEIGHT}px;
  overflow-y: scroll;
  border-radius: ${(props) => props.theme.borderRadius.sm};
`;
