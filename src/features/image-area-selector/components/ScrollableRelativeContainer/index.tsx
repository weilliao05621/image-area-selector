import { forwardRef, type ReactNode } from "react";

import styled from "@emotion/styled";

// constants
import { MAX_IMAGE_UPLOAD_PANEL_CONTENT_HEIGHT } from "../../constants/layout.constant";

interface ImageAreaSelectorProps {
  children: ReactNode;
}

const ScrollableRelativeContainer = forwardRef<
  HTMLDivElement,
  ImageAreaSelectorProps
>((props, ref) => {
  return <ScrollableWrapper ref={ref}>{props.children}</ScrollableWrapper>;
});

export default ScrollableRelativeContainer;

const ScrollableWrapper = styled.div`
  position: relative;
  user-select: none;
  width: 100%;
  max-height: ${MAX_IMAGE_UPLOAD_PANEL_CONTENT_HEIGHT}px;
  overflow-y: scroll;
  border-radius: ${(props) => props.theme.borderRadius.sm};
`;
