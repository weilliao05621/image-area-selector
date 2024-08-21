import { type ReactNode } from "react";

import styled from "@emotion/styled";
import {
  MAX_IMAGE_CONTAINER_WIDTH,
  MAX_IMAGE_UPLOAD_PANEL_CONTENT_HEIGHT,
} from "@/constants/layout.constant";

interface ImagePanelContentProps {
  children: ReactNode;
  imageUrl: string;
}

function ImagePanelContent(props: ImagePanelContentProps) {
  return (
    <Wrapper>
      <UploadedImage
        src={props.imageUrl}
        alt="for marquee selections"
        draggable={false}
      />
      {props.children}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  user-select: none;
  max-width: ${MAX_IMAGE_CONTAINER_WIDTH}px;
  max-height: ${MAX_IMAGE_UPLOAD_PANEL_CONTENT_HEIGHT}px;
  overflow-y: scroll;
  border-radius: ${(props) => props.theme.borderRadius.sm};
`;

const UploadedImage = styled.img`
  display: block;
  width: ${MAX_IMAGE_CONTAINER_WIDTH}px;
  object-fit: contain;
`;

export default ImagePanelContent;
